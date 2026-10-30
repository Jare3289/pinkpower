import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # Layout & Containers
    (r'className="app(\s.*?|)"', r'className="d-flex w-100 h-100" style={{minHeight: "100vh", overflow: "hidden"}}'),
    (r'className="main"', r'className="flex-grow-1 overflow-auto p-4 bg-light"'),
    (r'className="tab-content"', r'className="container-fluid mt-4"'),
    
    # Sidebar
    (r'className="sidebar"', r'className="d-none d-md-flex flex-column flex-shrink-0 p-3 text-white" style={{width: "280px", backgroundColor: "var(--bs-primary-dark, #2e101c)", overflowY: "auto", height: "100vh"}}'),
    (r'className="brand"', r'className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none border-bottom border-secondary pb-3"'),
    (r'className="brand-info"', r'className="d-flex align-items-center gap-3"'),
    (r'className="brand-title"', r'className="fs-4 fw-bold mb-0"'),
    (r'className="brand-sub"', r'className="small text-white-50"'),
    (r'className="nav-section"', r'className="text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-2"'),
    (r'className="nav-item"', r'className="nav-link text-white d-flex align-items-center gap-2 rounded-3 mb-1"'),
    (r'className=\{"nav-item" \+ \(active === it\.id \? " active" : ""\)\}', r'className={`nav-link text-white d-flex align-items-center gap-2 rounded-3 mb-1 ${active === it.id ? "bg-primary shadow-sm" : "hover-bg-dark"}`}'),
    (r'className="nav"', r'className="nav nav-pills flex-column mb-auto"'),
    
    # Header
    (r'className="header"', r'className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4"'),
    (r'className="page-title"', r'className="fs-3 fw-bold mb-0 text-dark"'),
    (r'className="crumbs"', r'className="text-muted small mb-1"'),
    (r'className="btn-back"', r'className="btn btn-sm btn-outline-secondary me-2 rounded-pill"'),
    (r'className="header-actions"', r'className="d-flex align-items-center gap-3"'),
    
    # Cards
    (r'className="card grid-card"', r'className="card shadow-sm border-0 mb-4 rounded-4"'),
    (r'className="card"', r'className="card shadow-sm border-0 mb-4 rounded-4"'),
    (r'className="card-head"', r'className="card-header bg-white border-0 d-flex justify-content-between align-items-center p-4 pb-0 rounded-top-4"'),
    (r'className="card-title"', r'className="fs-5 fw-bold text-dark mb-1"'),
    (r'className="card-sub"', r'className="text-muted small mb-0"'),
    
    # Tables
    (r'className="grid-scroll"', r'className="table-responsive p-4 pt-2"'),
    (r'className="table-scroller"', r'className="table-responsive p-4 pt-2"'),
    (r'className="grid-table"', r'className="table table-bordered table-hover align-middle mb-0"'),
    (r'className="mgmt-table"', r'className="table table-hover align-middle mb-0"'),
    
    # Buttons
    (r'className="btn btn-primary"', r'className="btn btn-primary shadow-sm rounded-pill px-4 fw-medium"'),
    (r'className="btn btn-ghost"', r'className="btn btn-light shadow-sm rounded-pill px-3 fw-medium"'),
    (r'className="btn btn-danger"', r'className="btn btn-danger shadow-sm rounded-pill px-4 fw-medium"'),
    (r'className="ghost-pill"', r'className="btn btn-sm btn-outline-secondary rounded-pill me-2"'),
    
    # Forms
    (r'className="text-input"', r'className="form-control rounded-3"'),
    (r'className="select-input"', r'className="form-select rounded-3"'),
    (r'className="form-label"', r'className="form-label fw-medium small text-muted"'),
    (r'className="form-group"', r'className="mb-3"'),
    
    # KPIs
    (r'className="kpi-grid"', r'className="row g-4 mb-4"'),
    (r'className="kpi-card"', r'className="col-12 col-md-4"\n                            ><div className="card shadow-sm border-0 rounded-4 h-100 p-4 position-relative overflow-hidden"'),
    (r'className="kpi-tag"', r'className="badge bg-light text-secondary rounded-pill mb-3"'),
    (r'className="kpi-title"', r'className="text-muted small fw-bold text-uppercase mb-1"'),
    (r'className="kpi-big"', r'className="d-flex align-items-baseline gap-2 mb-3"'),
    (r'className="kpi-big-num"', r'className="display-4 fw-bold text-primary mb-0"'),
    (r'className="kpi-unit"', r'className="text-muted small"'),
    (r'className="kpi-meta-row"', r'className="d-flex justify-content-between small text-muted border-bottom py-1"'),
    
    # Home Menu
    (r'className="home-grid"', r'className="row g-4"'),
    (r'className="home-card" onClick=\{.*?\}', r'className="col-6 col-md-4 col-lg-3"><div className="card shadow-sm border-0 rounded-4 h-100 p-4 text-center cursor-pointer hover-lift" onClick={() => window.location.href = m.id + ".php"}'),
    (r'className="home-card-icon"', r'className="display-4 mb-3"'),
    (r'className="home-card-title"', r'className="fs-6 fw-bold text-dark mb-2"'),
    (r'className="home-card-desc"', r'className="small text-muted mb-0"'),
    
    # Badges/Chips
    (r'className=\{"chip chip-" \+ d\.level\.toLowerCase\(\)\}', r'className={`badge rounded-pill fw-normal px-3 py-2 ${d.level === "High" ? "bg-danger" : d.level === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"}`}'),
    (r'className=\{"chip chip-" \+ r\.duty\.level\.toLowerCase\(\)\}', r'className={`badge rounded-pill fw-normal px-3 py-2 ${r.duty.level === "High" ? "bg-danger" : r.duty.level === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"}`}'),
    
    # Icons
    (r'<span className="nav-icon">\{it\.icon\}</span>', r'<span className="nav-icon me-2">{it.icon}</span>'),
]

new_content = content
for pattern, repl in replacements:
    new_content = re.sub(pattern, repl, new_content)

# Fix double div in kpi card
new_content = new_content.replace('className="col-12 col-md-4"\n                            ><div className="card', 'className="col-12 col-md-4"><div className="card')
new_content = new_content.replace('className="col-6 col-md-4 col-lg-3"\n                        ><div className="card', 'className="col-6 col-md-4 col-lg-3"><div className="card')

# Add closing divs for mapped home cards
new_content = re.sub(r'(<h3 className="fs-6 fw-bold text-dark mb-2">\{m\.label\}</h3>\s*<p className="small text-muted mb-0">\{m\.desc\}</p>\s*)</div>', r'\1</div></div>', new_content)
new_content = re.sub(r'(<div className="kpi-meta">\s*\{c\.meta\.map\(\(m, j\) => \(\s*<div key=\{j\} className="d-flex justify-content-between small text-muted border-bottom py-1">\s*<span>\{m\.k\}</span>\s*<span className="kpi-meta-v">\{m\.v\}</span>\s*</div>\s*\)\)\}\s*</div>\s*)</div>', r'\1</div></div>', new_content)


with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
