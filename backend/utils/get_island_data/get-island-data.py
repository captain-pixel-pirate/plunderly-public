import requests
from bs4 import BeautifulSoup
import re
import json

# URL and JavaScript element selector provided in the comment
ISLAND = "cerulean"
URL = f"https://{ISLAND}.puzzlepirates.com/yoweb/island/info.wm?showAll=true"
JS_ELEMENT_SELECTOR = 'document.querySelector("body > center")'

# 1. Fetch the page content from the URL
response = requests.get(URL)
html_content = response.text

# 2. Parse the HTML using BeautifulSoup
soup = BeautifulSoup(html_content, "html.parser")

# 3. Locate the main <center> element using the equivalent CSS selector "body > center"
main_center = soup.select_one("body > center")
if not main_center:
    raise Exception("Main center element not found")

islands = []

# 4. Iterate through all the <center> tags that contain island information.
#    (The first <center> might be a header, so we check for a <font> with size "+1")
for center in main_center.find_all("center", recursive=False):
    # Check if this center contains an island block by looking for the island name in a <font> tag.
    font_tag = center.find("font", attrs={"size": "+1"})
    if not font_tag:
        continue  # Skip if no island info is present in this center tag

    island = {}

    # Extract island name from the <font> tag
    island["name"] = font_tag.get_text(strip=True)

    # Convert the inner HTML of the center to a string for regex extraction.
    center_html = str(center)

    # Extract population by looking for the pattern "Population: <number>" including commas
    pop_match = re.search(r"Population:\s*([\d,]+)", center_html)
    if pop_match:
        population_str = pop_match.group(1).replace(",", "")  # remove commas
        island["population"] = int(population_str)
    else:
        island["population"] = None

    # Extract governor details: search for an anchor tag linking to the pirate page.
    gov_anchor = center.find("a", href=re.compile(r"/yoweb/pirate\.wm"))
    if gov_anchor:
        island["governor"] = gov_anchor.get_text(strip=True)
        island["governor_link"] = gov_anchor.get("href")
    else:
        island["governor"] = None
        island["governor_link"] = None

    # Extract property tax: capture the value after "Property tax:"
    tax_match = re.search(r"Property tax:\s*([^<\n]+)", center_html)
    island["property_tax"] = tax_match.group(1).strip() if tax_match else None

    # 5. Get the flag information from the <a> tag immediately following the center tag.
    flag_anchor = center.find_next_sibling("a")
    if flag_anchor:
        island["flag"] = flag_anchor.get_text(strip=True)
        island["flag_link"] = flag_anchor.get("href")
    else:
        island["flag"] = None
        island["flag_link"] = None

    islands.append(island)

# 6. Save the island information to a JSON file.
with open("islands.json", "w") as outfile:
    json.dump(islands, outfile, indent=4)

print("Island information saved to islands.json")
