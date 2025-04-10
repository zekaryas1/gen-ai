- A Rag based python cli app to search through youtube subtitles/transcripts

## How it works

- How it works, it has two parts load and search
  - Load
    - downloads a transcripts from YouTube url using yt_dlp
    - parse and segment the transcripts into chunks of fixed time-length
    - load the chunks to vector db(qdrant this time)
  - Search
    - given a query the program passes the query to the vector store
    - result includes
      - video title, score and link with start and end time in second

## How to use or test

- Start the vector store
  - [Local Quickstart - Qdrant](https://qdrant.tech/documentation/quickstart/)

- Load a video or playlist
  - playlist_name: name to uniquely identify this playlist, used as table name(collection name)
    - this field is required
    - you can load many playlists
    - if you try to load the same playlist again, the existing data and files will be deleted first.
  - playlist_url: the link to the playlist or a single video

```
uv run main.py --name {playlist_name} --load {playlist_url}
```

- Search your collections
    - query: what you are searching for
      - ex: could be what you remember but do not know which episode it is

```
uv run main.py --name {playlist_name} --search {query}
```

- Load and search

```
uv run main.py --name {playlist_name} --load {playlist_url} --search {query}
```


- test
  - D: load, search
  - D: load the same url
    - D: what happens to folder and database
  - load a video url
  - search is working per window frame, fix
  - check load and search