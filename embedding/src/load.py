from collections import defaultdict
import os
from qdrant_client import models
import uuid


def load_podcast_chunks(chunks, collection_name, db_client, encoder):
    for file_name in chunks:
        docs = []
        metas = []

        for data in chunks[file_name]:
            docs.append(data["text"])
            metas.append({
                "file_name": data["file_name"],
                "start": data["start"],
                "end": data["end"],
                "video_id": data["video_id"]
            })

        db_client.upload_points(
            collection_name=collection_name,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid1()),
                    vector=encoder.encode(docs[index]).tolist(),
                    payload=metas[index],
                )
                for index in range(len(docs))
            ],
        )


def store_subtitle_data(chunks, collection_name: str, client, encoder):
    if client.collection_exists(collection_name=collection_name):
        print(f"Removing existing collection called: {collection_name}.")
        client.delete_collection(collection_name=collection_name)

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=encoder.get_sentence_embedding_dimension(),  # Vector size is defined by used model
            distance=models.Distance.COSINE,
        ),
    )
    print(f"Created a new collection named: {collection_name}")

    # Iterate through all files in the directory
    load_podcast_chunks(chunks, collection_name, client, encoder)
