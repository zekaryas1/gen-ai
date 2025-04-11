### What is This?
This is a Retrieval-Augmented Generation (RAG) based Python CLI application designed to search through YouTube subtitles and transcripts.

#### Use Cases
This tool helps you answer questions like:
- "In which episode did the podcaster talk about X?"
  - Ideal for podcasts or series with hundreds of episodes, where manually searching is impractical. It identifies the specific episodes and timestamps (in seconds) where the topic "X" is mentioned.
  - Supports long-form videos and playlists.

#### Demos

- In this first demo, a user on reddit asked [when did the podcaster talked about "the word cat only means something because it isn't the word cow"](https://www.reddit.com/r/PhilosophizeThis/comments/136f4p2/looking_for_an_episodephilosopher/)


https://github.com/user-attachments/assets/43cd4ccc-d9ae-492c-a924-9feec996820e



- In the second demo, similarly a user on reddit asked [when did the podcaster talked about "romantic love starting to resemble greed"](https://www.reddit.com/r/PhilosophizeThis/comments/14jqc9b/help_me_find_episode/)


https://github.com/user-attachments/assets/166c6682-45b3-4450-a1c2-d0118545f4b5


---

### How It Works
The application operates in two main phases: **Load** and **Search**.

#### Load Phase
- Downloads transcripts from a YouTube URL using `yt-dlp`.
- Parses and segments the transcripts into fixed time-length chunks.
- Stores these chunks in a vector database (currently Qdrant).

#### Search Phase
- Accepts a user query and queries the vector store.
- Returns results including:
  - Video title
  - Relevance score
  - Link to the video with start and end times (in seconds)

### How to Use or Test

#### Prerequisites
- Ensure the vector store (Qdrant) is running. Follow the [Local Quickstart - Qdrant](https://qdrant.tech/documentation/quickstart/) guide to set it up locally.

#### Commands

1. **Load a Video or Playlist**
   - Use the `--name` flag to specify a unique identifier for the playlist (this serves as the collection name in the database).
   - Use the `--load` flag followed by the URL of a playlist or single video.
   - **Note**: If you attempt to load the same playlist again, existing data and files will be deleted first.

   Example:
   ```bash
   uv run main.py --name {playlist_name} --load {playlist_url}
   ```

   - You can load multiple playlists, each identified by a unique name.

2. **Search Your Collections**
   - Use the `--search` flag followed by your query (e.g., a topic or phrase you’re looking for).

   Example:
   ```bash
   uv run main.py --name {playlist_name} --search {query}
   ```

   - Example query: "Which episode discussed artificial intelligence?"

3. **Load and Search in One Command**
   - Combine both operations by specifying both `--load` and `--search` in the same command.

   Example:
   ```bash
   uv run main.py --name {playlist_name} --load {playlist_url} --search {query}
   ```

### Limitations and Further Improvements
  - Relies on a separate Qdrant instance; consider using a locally embedded database instead of Docker for simplicity.
  - Search accuracy may need improvement; explore techniques to enhance relevance and precision.
  - Currently, tested only on YouTube videos.
