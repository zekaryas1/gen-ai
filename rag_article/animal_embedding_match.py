import llm

def cosine_similarity(vector1, vector2):
    """
    Calculate the cosine similarity between two vectors.
    """
    dot_product = sum(x * y for x, y in zip(vector1, vector2))
    magnitude1 = sum(x * x for x in vector1) ** 0.5
    magnitude2 = sum(y * y for y in vector2) ** 0.5

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0  # Avoid division by zero

    return dot_product / (magnitude1 * magnitude2)


if __name__ == "__main__":
    # Load a sentence embedding model
    embedding_model = llm.get_embedding_model("sentence-transformers/all-MiniLM-L6-v2")

    # List of descriptive sentences to compare with the user's query
    descriptions = [
        "A loyal and social animal known for its strong bond with humans.",
        "A powerful and majestic animal often called the king of the jungle.",
        "A sharp-eyed species of prey that soars high and hunts with precision.",
        "The fastest land animal, built for explosive speed and agility.",
        "An aquatic creature that breathes through gills and thrives underwater.",
        "An intelligent, affectionate companion known for its protective nature."
    ]

    query = "dog"

    # Generate and store embeddings for all descriptions
    description_embeddings = {
        text: embedding_model.embed(text) for text in descriptions
    }

    query_embedding = embedding_model.embed(query)

    # Compute similarity scores between query and each description
    similarity_scores = []
    for description, embedding in description_embeddings.items():
        similarity = cosine_similarity(query_embedding, embedding)
        similarity_scores.append((description, similarity))

    # Sort results by similarity (highest first)
    similarity_scores.sort(key=lambda item: item[1], reverse=True)

    for description, score in similarity_scores:
        print(f"{score:.4f} - {description}")
