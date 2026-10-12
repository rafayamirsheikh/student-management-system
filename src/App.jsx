
import { useEffect, useState } from "react";
import "./App.css";
const API = "/api/students";
const emptyForm = {
  studentName: "",
  email: "",
  fatherName: "",
  courseName: "",
  feeStructure: "",
  subjects: "",
  classTiming: "",
};
function App() {
  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function fetchStudents() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Students load nahi huay");
      const data = await response.json();
      setStudents(data);
    } catch {
      setMessage("Backend check karo: port 5000 par server chalu hona chahiye.");
    }
  }
  useEffect(() => {
    fetchStudents();
  }, []);
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const studentData = {
      ...form,
      feeStructure: Number(form.feeStructure),
      subjects: form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    };
    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Student save nahi hua");
      }
      setMessage(editingId ? "Student update ho gaya!" : "Student add ho gaya!");
      setForm(emptyForm);
      setEditingId(null);
      await fetchStudents();
    } catch (error) {
      setMessage(error.message || "Kuch ghalat ho gaya.");
    } finally {
      setLoading(false);
    }
  }
  function handleEdit(student) {
    setEditingId(student._id);
    setForm({
      studentName: student.studentName || "",
      email: student.email || "",
      fatherName: student.fatherName || "",
      courseName: student.courseName || "",
      feeStructure: String(student.feeStructure ?? ""),
      subjects: (student.subjects || []).join(", "),
      classTiming: student.classTiming || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function handleDelete(id) {
  if (!window.confirm("Kya tum is student ko delete karna chahte ho?")) {
    return;
  }
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });
     console.log("DELETE URL:", `${API}/${id}`);
     console.log ("DELETE STATUS:", response.status);
    const text = await response.text();
    let result = {};
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Server DELETE request accept nahi kar raha. Vercel API route check karna hoga."
      );
    }
    if (!response.ok) {
      throw new Error(result.message || "Delete nahi hua");
    }
    setMessage("Student delete ho gaya!");
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await fetchStudents();
  } catch (error) {
    setMessage(error.message || "Delete karte waqt error aya.");
  }
}
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }
  return (
    <main className="app">
      <header className="hero">
        <div className="hero-icon">🎓</div>
        <p className="eyebrow">STUDENT PORTAL</p>
        <h1>Student Management System</h1>
        <p className="subtitle">
          Manage student records easily in one place.
        </p>
      </header>
      <section className="stats">
        <div className="stat-card">
          <span className="stat-icon">👨‍🎓</span>
          <div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div>
            <p>Available Courses</p>
            <h2>{new Set(students.map((s) => s.courseName)).size}</h2>
          </div>
        </div>
      </section>
      <section className="panel form-panel">
        <div className="section-heading">
          <div>
            <span className="section-label">STUDENT RECORD</span>
            <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
          </div>
          <span className="heading-icon">✍️</span>
        </div>
        {message && (
          <div className="message" role="status">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student Name *
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Enter student name"
                required
              />
            </label>
            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </label>
            <label>
              Father's Name *
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                placeholder="Enter father's name"
                required
              />
            </label>
            <label>
              Course Name *
              <input
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="e.g. Web Development"
                required
              />
            </label>
            <label>
              Fee Structure (PKR) *
              <input
                type="number"
                min="0"
                name="feeStructure"
                value={form.feeStructure}
                onChange={handleChange}
                placeholder="e.g. 15000"
                required
              />
            </label>
            <label>
              Class Timing *
              <select
                name="classTiming"
                value={form.classTiming}
                onChange={handleChange}
                required
              >
                <option value="">Select class timing</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Weekend">Weekend</option>
              </select>
            </label>
            <label className="full-width">
              Subjects *
              <input
                name="subjects"
                value={form.subjects}
                onChange={handleChange}
                placeholder="HTML, CSS, JavaScript (comma separated)"
                required
              />
              <small>Multiple subjects ke darmiyan comma lagao.</small>
            </label>
          </div>
          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn btn-cancel"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? "Please wait..."
                : editingId
                  ? "Update Student"
                  : "+ Add Student"}
            </button>
          </div>
        </form>
      </section>
      <section className="panel table-panel">
        <div className="section-heading">
          <div>
            <span className="section-label">DATABASE RECORDS</span>
            <h2>All Students</h2>
          </div>
          <span className="count-badge">{students.length} Records</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Father's Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Fee (PKR)</th>
                <th>Subjects</th>
                <th>Timing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <span>📋</span>
                    <strong>No students found</strong>
                    <p>Add your first student using the form above.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td className="student-name">{student.studentName}</td>
                    <td>{student.fatherName}</td>
                    <td>{student.email}</td>
                    <td><span className="course-tag">{student.courseName}</span></td>
                    <td>{Number(student.feeStructure).toLocaleString("en-PK")}</td>
                    <td>{(student.subjects || []).join(", ")}</td>
                    <td>{student.classTiming}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(student)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(student._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
       <footer>Student Management System . built with MERN stack</footer>
    </main>
  );
}
export default App;