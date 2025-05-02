from src.sparse import Recommender

START_YEAR = 2000

if __name__ == "__main__":
    recommender = Recommender()

    movies_df, ratings_df = recommender.load_and_filter_data(START_YEAR)
    agg_ratings_df = recommender.prepare_ratings_data(movies_df, ratings_df)
    sparse_vectors = recommender.convert_to_sparse_vectors(agg_ratings_df)

    recommender.setup_collection(delete_existing=True)
    recommender.upload_data(sparse_vectors)

    # My personal movie ratings (positive: liked, negative: disliked)
    # Should be beyond START YEAR
    my_ratings = {
        78499: 1,  # Toy Story 3
        78469: 1,  # The A-Team
        680: 1,  # Pulp Fiction
        13: 1,  # Forrest Gump
        102880: -1,  # After Earth
        120: 1,  # Lord of the Rings: The Fellowship of the Ring
        180297: -1,  # The Disaster Artist
        84152: 1,  # Limitless
        6365: 1,  # The Matrix
        109487: 1,  # Interstellar
        135569: 1  # Star Trek Beyond
    }

    recommendations = recommender.recommend(my_ratings, movies_df, TOP_K)
    for title, score, movie_id in recommendations:
        print(f"{title}: {score:.3f} (ID: {movie_id})")