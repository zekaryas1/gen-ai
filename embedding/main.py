import argparse
import shutil

from src.load import store_subtitle_data
from src.processor import process_subtitle_file
from src.search import initiate_rag_search
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
import yt_dlp
import os

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="A RAG based search script based on youtube video subtitles.")

    # Add arguments
    parser.add_argument('--name', type=str, help='The name of the store to work on', required=True)
    parser.add_argument('--load', type=str, help='Youtube video or playlist url')
    parser.add_argument('--search', type=str, help='The query you need me to search for')

    # parse args
    args = parser.parse_args()
    search_query = args.search
    load_url = args.load
    collection_name = args.name
    segment_point_in_second = 30  # segments subtitles per 30-second window frame

    # qdrant options
    encoder = SentenceTransformer("all-MiniLM-L6-v2")
    qdrant_client = QdrantClient(url="http://localhost:6333")

    if not load_url and not search_query:
        print("Error: Please indicate what you want to do: load, search or both(load then search)")

    # search logic
    if search_query and qdrant_client.collection_exists(collection_name):

        print(f"Searching for: '{search_query}' in collection: '{collection_name}")
        hits = initiate_rag_search(
            query=args.search,
            collection_name=collection_name,
            client=qdrant_client,
            encoder=encoder
        )

        counter = 1
        for pointGroup in hits.groups:
            for hit in pointGroup.hits:
                metas = hit.payload
                file_name = metas["file_name"]
                start_time = metas["start"]
                end_time = metas["end"]
                video_id = metas["video_id"]

                print(f"{counter}. {file_name}. Confidence score = {hit.score}.")
                print(f"\t - https://www.youtube.com/watch?v={video_id}&start={start_time}&end={end_time}")
                counter += 1
    elif search_query:
        print(f"The collection: '{collection_name}' does not exist")

    # load logic
    if load_url:
        print(f"Downloading subtitle for: {load_url} URL for collection: '{collection_name}'")

        input_path = f"collections/{collection_name}/subtitles"  # where to store the downloaded subtitles

        if os.path.isdir(input_path):
            print("Deleting existing directory")
            shutil.rmtree(input_path)

        ydl_opts = {
            'skip_download': True,
            'subtitlesformat': 'vtt',
            'subtitleslangs': ['en'],
            'writeautomaticsub': True,
            'writesubtitles': True,
            "ignoreerrors": True, #skip private videos
            "paths": {
                "home": input_path
            }
        }
        try:
            # Create a YoutubeDL instance and extract information
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Download/extract subtitles
                error_code = ydl.download([load_url])
                print(f"yt_dlp error code {error_code}")

            print(f"Downloading subtitle done, starting chunk process")
            chunks = process_subtitle_file(input_path, segment_point_in_second)

            print(f"Finished creating chunks for: {len(chunks)} files, next storing to db")
            store_subtitle_data(
                chunks=chunks,
                collection_name=collection_name,
                client=qdrant_client,
                encoder=encoder
            )
            "going on a hike and meeting a blackbear, he teases that the experience gave him a realisation which seems to have 'cured' his anxiety, he says he doesn't know in what format to tell the story"

            print("Finished storing.")
        except Exception as e:
            print(f"An error occurred: {str(e)}")
