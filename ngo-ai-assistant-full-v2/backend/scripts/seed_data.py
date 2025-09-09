from app.services import store

docs = [
    ("Heritage Preservation NGO is dedicated to protecting cultural heritage through volunteer projects.", "about"),
    ("Upcoming project: Community cleanup in September 2025.", "projects"),
    ("Volunteers can apply online via our website or email info@heritage-ngo.org", "volunteer"),
]

for text, src in docs:
    store.add(text, src)

print("Seed data inserted into Chroma.")
