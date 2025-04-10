def initiate_rag_search(query: str, collection_name, client, encoder, group_key="file_name"):
    return client.query_points_groups(
        collection_name=collection_name,
        query=encoder.encode(query).tolist(),
        group_by=group_key,
        group_size=1,
        limit=3
    )