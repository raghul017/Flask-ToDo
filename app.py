from flask import (
    Flask,
    jsonify,
    abort,
    make_response,
    render_template,
    request,
    send_from_directory,
)
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

tasks = [
    {
        "id": 1,
        "title": "Be Glad. Be good, Be brave",
        "description": "If I were a neurosurgeon and I announce that I had to leave my guests to go in",
        "done": False,
    },
    {
        "id": 2,
        "title": "Remarkable Essay",
        "description": "While Shailesh was writing this book, he published a short, remarkable essay",
        "done": False,
    },
]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/todo/api/v1.0/tasks", methods=["GET"])
def get_tasks():
    return jsonify({"tasks": tasks})


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({"error": "Invalid Request made Not found"}), 404)


@app.route("/todo/api/v1.0/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = [task for task in tasks if task["id"] == task_id]
    if len(task) == 0:
        abort(404)
    return jsonify({"task": task[0]})


@app.route("/todo/api/v1.0/tasks", methods=["POST"])
def create_task():
    if not request.json or not "title" in request.json:
        abort(400)
    task = {
        "id": tasks[-1]["id"] + 1 if tasks else 1,
        "title": request.json["title"],
        "description": request.json.get("description", ""),
        "done": False,
    }
    tasks.append(task)
    return jsonify({"task": task}), 201


@app.route("/todo/api/v1.0/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task = [task for task in tasks if task["id"] == task_id]
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if "title" in request.json and not isinstance(request.json["title"], str):
        abort(400)
    if "description" in request.json and not isinstance(request.json["description"], str):
        abort(400)
    if "done" in request.json and not isinstance(request.json["done"], bool):
        abort(400)
    task[0]["title"] = request.json.get("title", task[0]["title"])
    task[0]["description"] = request.json.get("description", task[0]["description"])
    task[0]["done"] = request.json.get("done", task[0]["done"])
    return jsonify({"task": task[0]})


@app.route("/todo/api/v1.0/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = [task for task in tasks if task["id"] == task_id]
    if len(task) == 0:
        abort(404)
    tasks.remove(task[0])
    return jsonify({"result": True})


if __name__ == "__main__":
    app.run(debug=True, port=5002)
