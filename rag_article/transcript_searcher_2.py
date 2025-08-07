from collections import defaultdict
import llm
import chromadb


def read_transcript_chunks(file_path):
    chunks = defaultdict(list)
    with open(file_path, "r") as file:
        for line in file:
            # Split line into minute (from MM:SS) and text content
            minute = line[:5].split(":")[0]
            text = line[6:].rstrip("\n")
            chunks[int(minute)].append(text)
    return chunks


def store_chunks_in_db(chunks, collection, video_id):
    for minute, texts in chunks.items():
        # Combine texts for the same minute into a single string
        combined_text = " ".join(texts)
        collection.add(
            ids=[str(minute)],
            documents=[combined_text],
            metadatas=[{"video_id": video_id, "start_time": minute * 60}],
        )


def search_similar_chunks(query, collection):
    results = collection.query(
        query_texts=[query],
        n_results=10,
    )
    links = []
    for metadata in results.get("metadatas") or []:
        for meta in metadata:
            links.append(f"https://youtu.be/{meta['video_id']}?t={meta['start_time']}")
    return links


if __name__ == "__main__":
    TRANSCRIPT_FILE = "DHH Future of Programming, AI, Ruby on Rails, Productivity & Parenting  Lex Fridman Podcast #474.txt"
    VIDEO_ID = "vagyIcmIGOQ"

    # Initialize Chroma DB client and collection
    chroma_client = chromadb.PersistentClient()
    collection = chroma_client.get_or_create_collection(name="podcast_transcripts")

    # Load and store chunks if the collection is empty
    if collection.count() == 0:
        transcript_chunks = read_transcript_chunks(TRANSCRIPT_FILE)
        store_chunks_in_db(transcript_chunks, collection, VIDEO_ID)

    user_query = "why managers suck and are useless"
    youtube_links = search_similar_chunks(user_query, collection)

    # Print YouTube links for the top matches
    for link in youtube_links:
        print(link)
