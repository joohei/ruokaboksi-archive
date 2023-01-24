import os
import json
import pandas as pd
import collections
from PIL import Image

for file in os.scandir("OneDrive"):
    if file.is_file():
        df = pd.read_excel(file.path, "lista").T

        data = {df[row]["Vihko"]: {} for row in df}

        for row in df:
            data[df[row]["Vihko"]][df[row]["Resepti"]] = {}

        for row in df:
            data[df[row]["Vihko"]][df[row]["Resepti"]] = dict(
                name=df[row]["Nimi"],
                rate=df[row]["Arvosana"],
                tags=df[row][4:].dropna().to_list()
            )

        with open("data.json", "w") as f:
            json.dump(data, f, indent=2)

        df = pd.read_excel(file.path, "valinnat")

        config = dict(
            ingredients=df["Aine"].to_list()
        )

        with open("config.json", "w") as f:
            json.dump(config, f, indent=2)
        
        df = pd.read_excel(file.path, "hyllylista").dropna().T

        shelf_data = dict()

        for column in df:
            shelf_data[df[column]["Aine"]] = df[column]["Hylly"]

        with open("shelf_data.json", "w") as f:
            json.dump(shelf_data, f, indent=2)

        for major in data:
            for minor in data[major]:
                text_data = collections.defaultdict(list)

                for tag in data[major][minor]["tags"]:
                    if tag in shelf_data:
                        text_data[shelf_data[tag]].append(tag)

                    with open(f"ingredients/{major}_{minor}.txt", "w", encoding="latin-1") as f:
                        for title in text_data:
                            f.write(f"{title}\n")

                            for tag in text_data[title]:
                                f.writelines(f"- {tag}\n")

                            f.write("\n")

    else:
        for file in os.scandir(file.path):
            name = file.name.split(".")[0] + ".webp"
            if name not in os.listdir("photos"):
                im = Image.open(file.path)

                width, height = im.size
                size = width // 3, height // 3

                im.thumbnail(size, Image.Resampling.LANCZOS)
                im.save(f"photos/{name}", format="webp")
