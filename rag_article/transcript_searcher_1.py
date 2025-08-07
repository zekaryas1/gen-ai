from collections import defaultdict
import llm
from llm import cosine_similarity

def read_transcript_chunks(file_path):
    chunks = defaultdict(list)
    with open(file_path, "r") as file:
        for line in file:
            # Extract minute from timestamp (format: MM:SS) and text content
            minute, text = line[:5].split(":")[0], line[6:]
            chunks[int(minute)].append(text.rstrip("\n"))
    return chunks

def embed_transcript_chunks(chunks, embedding_model):
    embeddings = {}
    for minute, texts in chunks.items():
        # Combine text chunks for the same minute into a single string
        combined_text = " ".join(texts)
        embeddings[minute] = embedding_model.embed(combined_text)
    return embeddings

def find_sorted_similar_chunks(query, embeddings, embedding_model):
    query_embedding = embedding_model.embed(query)
    similarity_scores = [
        [minute, cosine_similarity(embedding, query_embedding)]
        for minute, embedding in embeddings.items()
    ]
    similarity_scores.sort(key=lambda x: x[1], reverse=True)
    return similarity_scores

def generate_youtube_links(similarity_scores, video_id):
    return [
        (score, f"https://youtu.be/{video_id}?t={minute * 60}")
        for minute, score in similarity_scores
    ]

if __name__ == "__main__":
    TRANSCRIPT_FILE = "DHH Future of Programming, AI, Ruby on Rails, Productivity & Parenting  Lex Fridman Podcast #474.txt"
    VIDEO_ID = "vagyIcmIGOQ"

    transcript_chunks = read_transcript_chunks(TRANSCRIPT_FILE)

    embedding_model = llm.get_embedding_model("sentence-transformers/all-MiniLM-L6-v2")

    chunk_embeddings = embed_transcript_chunks(transcript_chunks, embedding_model)

    user_query = "why managers suck and are useless"

    similarity_results = find_sorted_similar_chunks(user_query, chunk_embeddings, embedding_model)

    # Generate YouTube links for the top 10 matches
    top_links = generate_youtube_links(similarity_results[:10], VIDEO_ID)

    for score, link in top_links:
        print(f"Similarity: {score:.2f} - {link}")