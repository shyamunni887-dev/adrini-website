with open("src/styles/index.css", "r") as f:
    content = f.read()

new_content = content.replace("#8a7d6b", "#756a5b")

with open("src/styles/index.css", "w") as f:
    f.write(new_content)
print("Updated CSS color")
