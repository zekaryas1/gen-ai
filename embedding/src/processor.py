import os
from collections import defaultdict
import webvtt


def get_youtube_id(file_name: str):
    start = file_name.find("[")
    end = file_name.find("]")

    return file_name[start + 1: end]


def time_to_seconds(time_str):
    # Split the string into hours, minutes, seconds, and milliseconds
    hours, minutes, seconds_millis = time_str.split(':')
    seconds, milliseconds = seconds_millis.split('.')

    # Convert all to integers
    hours = int(hours)
    minutes = int(minutes)
    seconds = int(seconds)

    # Calculate total seconds
    total_seconds = hours * 3600 + minutes * 60 + seconds

    return total_seconds


def clean_file_name(file_name: str):
    index = file_name.rfind("[")
    return file_name[:index - 1].strip()


def process_subtitle_file(input_path, segment_time_second: int):
    chunks = defaultdict(list)

    for file_name in os.listdir(input_path):
        file_path = os.path.join(input_path, file_name)

        start_time = 0
        text = ""
        file_name_clean = clean_file_name(file_name)
        captions = webvtt.read(file_path)

        for caption in captions:
            end_time = time_to_seconds(caption.end)

            if end_time - start_time >= segment_time_second or caption == captions[-1]:
                if caption == captions[-1]:
                    text = text + " " + caption.text

                chunks[file_name_clean].append({
                    "file_name": file_name_clean,
                    "start": start_time,
                    "end": end_time,
                    "text": text.replace("\n", " "),
                    "video_id": get_youtube_id(file_name)
                })

                text = caption.text
                start_time = end_time
            else:
                text = text + " " + caption.text
    return chunks
