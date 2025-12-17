async function load(){
  const res = await fetch("data/posts.json", { cache: "no-store" });
  const data = await res.json();
  return data.posts || [];
}

function norm(s){
  return (s || "").toLowerCase();
}

function render(posts){
  const q = norm(document.getElementById("q").value);
  const student = document.getElementById("student").value;

  const results = document.getElementById("results");
  const empty = document.getElementById("empty");
  const stats = document.getElementById("stats");

  results.innerHTML = "";

  const filtered = posts.filter(p => {
    if (student && p.student_name !== student) return false;
    const hay = norm(
      p.title + " " +
      p.student_name + " " +
      p.body_text
    );
    return hay.includes(q);
  });

  stats.textContent = `${filtered.length} / ${posts.length} posts`;

  if (!filtered.length){
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  for (const p of filtered){
    const c = document.createElement("div");
    c.className = "card";

    const h = document.createElement("h3");
    const a = document.createElement("a");
    a.href = p.ed_url;
    a.target = "_blank";
    a.textContent = p.title;
    h.appendChild(a);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${p.student_name} • ${p.created_at || ""}`;

    const d = document.createElement("details");
    const s = document.createElement("summary");
    s.textContent = "Show full post text";
    d.appendChild(s);

    const pre = document.createElement("pre");
    pre.textContent = p.body_text || "";
    d.appendChild(pre);

    c.appendChild(h);
    c.appendChild(meta);
    c.appendChild(d);

    results.appendChild(c);
  }
}

(async function(){
  const posts = await load();

  const studentSel = document.getElementById("student");
  [...new Set(posts.map(p => p.student_name))].sort().forEach(n => {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n;
    studentSel.appendChild(o);
  });

  ["q","student"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => render(posts))
  );

  render(posts);
})();
