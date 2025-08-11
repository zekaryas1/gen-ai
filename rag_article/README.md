## Project 1: RAG

- [Building with Generative AI: Lessons from 5 Projects Part 1: RAG - DEV Community](https://dev.to/index_of_zack/building-with-generative-ai-lessons-from-5-projects-part-1-rag-16gi)

### Semantic search
- **Embedding models** (like transformer models) help with Semantic search. They take a piece of text and convert it into an **array of values** (vectors) that capture its **semantic meaning**.
- If we have two such vectors, we can compare them to see how closely they’re related. For example, comparing “dog” with “loyal animal” will result in a higher match score than comparing it with “fastest animal”.
	- Algorithms such as Cosine Similarity is used to find how close two vectors are.

```sh
uv run animal_embedding_match.py


#expected output
0.4043 - A loyal and social animal known for its strong bond with humans.
0.3416 - An intelligent, affectionate companion known for its protective nature.
0.3389 - The fastest land animal, built for explosive speed and agility.
0.2795 - A sharp-eyed species of prey that soars high and hunts with precision.
0.2369 - A powerful and majestic animal often called the king of the jungle.
0.2254 - An aquatic creature that breathes through gills and thrives underwater.
```


### Making the Response Coherent

- We have related text snippets, but they’re **scattered**, possibly pulled from different documents. If we return them as-is, it might confuse the user because the response won’t appear coherent.
- This is a perfect use case for **LLMs** (Large Language Models). They’re great at taking scattered data and generating **structured, coherent responses**.
- For example, you might want the response in **simple English**, in a **professional tone**, or in a **well-structured format**.

```sh
uv run model_response.py


#expect output similar to
Dogs are domesticated mammals that have been trained to perform various tasks such as hunting, herding, assisting people with disabilities, and providing companionship. They come in a variety of breeds, each with their unique characteristics and abilities. Some common breeds include Border Collies, German Shepherds, Golden Retrievers, and Poodles. Dogs are known for their exceptional sense of smell, which is up to 100,000 times stronger than that of humans. They are social animals and thrive in companionship with people or other dogs.
```

## Project 2: Embeddings

- [Building with Generative AI: Lessons from 5 Projects Part 2: Embedding - DEV Community](https://dev.to/index_of_zack/building-with-generative-ai-lessons-from-5-projects-part-2-embedding-4bjj)


### Transcript Embedding 1: in-memory dictionary

In the following code, Let's consider [this](https://youtu.be/vagyIcmIGOQ) long podcast, 6 hours in duration, covering technical topics such as Ruby on Rails, AI, TypeScript, meetings, and more. The goal is to identify specific segments where a particular technical topic is discussed, such as where the guest, DHH, expresses his views on disliking managers.

```sh
uv run transcript_searcher_1.py

#Sample output
Similarity: 0.49 - https://youtu.be/vagyIcmIGOQ?t=8880
Similarity: 0.45 - https://youtu.be/vagyIcmIGOQ?t=8640
Similarity: 0.41 - https://youtu.be/vagyIcmIGOQ?t=8760
Similarity: 0.38 - https://youtu.be/vagyIcmIGOQ?t=8940
Similarity: 0.37 - https://youtu.be/vagyIcmIGOQ?t=9180
Similarity: 0.35 - https://youtu.be/vagyIcmIGOQ?t=9480
Similarity: 0.34 - https://youtu.be/vagyIcmIGOQ?t=8820
Similarity: 0.33 - https://youtu.be/vagyIcmIGOQ?t=9120
Similarity: 0.32 - https://youtu.be/vagyIcmIGOQ?t=16140
Similarity: 0.32 - https://youtu.be/vagyIcmIGOQ?t=9240
```

### Transcript embedding 2: Chroma store

Now that we understand vector databases and metadata filtering, let's enhance our previous code with improvements. We will use Chroma vector database, some features of Chroma worth knowing are

```shell
uv run transcript_searcher_2.py

#expect same output
Similarity: 0.49 - https://youtu.be/vagyIcmIGOQ?t=8880
Similarity: 0.45 - https://youtu.be/vagyIcmIGOQ?t=8640
Similarity: 0.41 - https://youtu.be/vagyIcmIGOQ?t=8760
Similarity: 0.38 - https://youtu.be/vagyIcmIGOQ?t=8940
Similarity: 0.37 - https://youtu.be/vagyIcmIGOQ?t=9180
Similarity: 0.35 - https://youtu.be/vagyIcmIGOQ?t=9480
Similarity: 0.34 - https://youtu.be/vagyIcmIGOQ?t=8820
Similarity: 0.33 - https://youtu.be/vagyIcmIGOQ?t=9120
Similarity: 0.32 - https://youtu.be/vagyIcmIGOQ?t=16140
Similarity: 0.32 - https://youtu.be/vagyIcmIGOQ?t=9240
```