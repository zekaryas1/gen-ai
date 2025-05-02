from collections import defaultdict
import os
import pandas as pd
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import PointStruct, SparseVector, NamedSparseVector
from typing import List, Tuple, Dict, Generator


DATA_DIR = "data"
MOVIES_CSV = os.path.join(DATA_DIR, "movies.csv")
RATINGS_CSV = os.path.join(DATA_DIR, "ratings.csv")
QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "movies"
TOP_K = 7  # Number of recommendations to return.


class Recommender:
    """
    A movie recommender system using sparse vectors and Qdrant for vector search.
    """

    def __init__(self, qdrant_url: str = QDRANT_URL):
        """
        Initialize the Qdrant client.
        """
        self.client = QdrantClient(url=qdrant_url)

    def load_and_filter_data(self, start_year: int) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Load movies and ratings, and filter movies by a start year.
        """
        movies_df = pd.read_csv(MOVIES_CSV, low_memory=False)
        ratings_df = pd.read_csv(RATINGS_CSV, low_memory=False)

        movies_df['year'] = pd.to_numeric(
            movies_df['title'].str.extract(r'\((\d{4})\)', expand=False),
            errors='coerce'
        )
        movies_df = movies_df.dropna(subset=['year']).copy()
        movies_df['year'] = movies_df['year'].astype(int)
        filtered_movies = movies_df[movies_df['year'] >= start_year].copy()

        valid_movie_ids = filtered_movies['movieId'].unique()
        filtered_ratings = ratings_df[ratings_df['movieId'].isin(valid_movie_ids)].copy()

        return filtered_movies, filtered_ratings

    def prepare_ratings_data(self, movies_df: pd.DataFrame, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize and merge ratings with movies metadata.
        """
        ratings_df['movieId'] = ratings_df['movieId'].astype(str)
        movies_df['movieId'] = movies_df['movieId'].astype(str)

        ratings_df['rating'] = (ratings_df['rating'] - ratings_df['rating'].mean()) / ratings_df['rating'].std()

        merged_df = ratings_df.merge(
            movies_df[['movieId', 'title']],
            on='movieId',
            how='inner'
        )

        return merged_df.groupby(['userId', 'movieId'])['rating'].mean().reset_index()

    def convert_to_sparse_vectors(self, agg_data: pd.DataFrame) -> Dict[int, Dict[str, List[float]]]:
        """
        Convert user ratings into sparse vectors.
        """
        sparse_vectors = defaultdict(lambda: {"values": [], "indices": []})
        for row in agg_data.itertuples():
            sparse_vectors[row.userId]["indices"].append(int(row.movieId))
            sparse_vectors[row.userId]["values"].append(row.rating)
        return sparse_vectors

    def generate_points(self, sparse_vectors) -> Generator[PointStruct, None, None]:
        """
        Generate Qdrant PointStruct objects for each user.
        """
        for user_id, vec in sparse_vectors.items():
            yield PointStruct(
                id=user_id,
                vector={"ratings": SparseVector(indices=vec["indices"], values=vec["values"])},
                payload={"user_id": user_id, "movie_id": vec["indices"]}
            )

    def to_sparse_vector(self, ratings: Dict[int, float]) -> SparseVector:
        """
        Convert a dictionary of movie ratings into a SparseVector.
        """
        return SparseVector(
            indices=list(ratings.keys()),
            values=list(ratings.values())
        )

    def get_unique_movie_scores(
            self,
            previous_ratings: Dict[int, float],
            results: List[models.ScoredPoint]
    ) -> Dict[int, float]:
        """
        Score movies not already rated by user.
        """
        movie_scores = defaultdict(float)
        for result in results:
            for movie_id in result.payload["movie_id"]:
                if movie_id not in previous_ratings:
                    movie_scores[movie_id] += result.score
        return movie_scores

    def setup_collection(self, delete_existing: bool = True) -> None:
        """
        Create or reset the Qdrant collection for storing sparse vectors.
        """
        if delete_existing and self.client.collection_exists(COLLECTION_NAME):
            self.client.delete_collection(COLLECTION_NAME)
        self.client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config={},
            sparse_vectors_config={"ratings": models.SparseVectorParams()}
        )

    def upload_data(self, sparse_vectors: Dict[int, Dict[str, List[float]]]) -> None:
        """
        Upload sparse vectors to Qdrant collection.
        """
        self.client.upload_points(
            collection_name=COLLECTION_NAME,
            points=self.generate_points(sparse_vectors)
        )

    def recommend(
            self,
            my_ratings: Dict[int, float],
            movies_df: pd.DataFrame,
            top_k: int
    ) -> List[Tuple[str, float, int]]:
        """
        Generate top-k movie recommendations based on user's ratings.
        """
        results = self.client.search(
            collection_name=COLLECTION_NAME,
            query_vector=NamedSparseVector(name="ratings", vector=self.to_sparse_vector(my_ratings)),
            limit=20
        )

        movie_scores = self.get_unique_movie_scores(my_ratings, results)
        top_movies = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        recommendations: List[Tuple[str, float, int]] = []
        for movie_id, score in top_movies:
            movie_row = movies_df[movies_df["movieId"] == str(movie_id)]
            if not movie_row.empty:
                recommendations.append((movie_row["title"].iloc[0], score, movie_id))

        return recommendations
