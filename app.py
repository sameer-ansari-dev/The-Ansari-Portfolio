"""
====================================================================
  Ansari Mohammed Sameer - Portfolio & Dynamic Content CMS
  Backend Server & Secret Admin Portal built with Python & Flask
====================================================================
"""

import os
import sys
import json
import uuid
import logging
from functools import wraps
from datetime import datetime

from flask import (
    Flask,
    render_template,
    send_from_directory,
    request,
    jsonify,
    session,
    redirect,
    url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Base directory paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

PORTFOLIO_DATA_FILE = os.path.join(DATA_DIR, 'portfolio_data.json')
ADMIN_CONFIG_FILE = os.path.join(DATA_DIR, 'admin_config.json')
MESSAGES_LOG_FILE = os.path.join(BASE_DIR, 'contact_messages.json')

# Initialize Flask app
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'assets'),
    static_url_path='/assets'
)

# -----------------------------------------------------------------------------
# Data Store Helpers
# -----------------------------------------------------------------------------

def load_admin_config():
    """Load admin credentials and secret key."""
    default_config = {
        "username": "sameer",
        "password_hash": generate_password_hash("sameer@ansari2026"),
        "secret_key": "ansari_super_secret_session_key_2026_dev_portfolio"
    }
    if not os.path.exists(ADMIN_CONFIG_FILE):
        save_admin_config(default_config)
        return default_config
    try:
        with open(ADMIN_CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading admin config: {e}")
        return default_config


def save_admin_config(config):
    """Save admin configuration to file."""
    try:
        with open(ADMIN_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error saving admin config: {e}")
        return False


def load_portfolio_data():
    """Load all portfolio content."""
    if not os.path.exists(PORTFOLIO_DATA_FILE):
        return {}
    try:
        with open(PORTFOLIO_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading portfolio data: {e}")
        return {}


def save_portfolio_data(data):
    """Save portfolio content to file."""
    try:
        with open(PORTFOLIO_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error saving portfolio data: {e}")
        return False


def load_messages():
    """Load contact inquiries."""
    if not os.path.exists(MESSAGES_LOG_FILE):
        return []
    try:
        with open(MESSAGES_LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading messages: {e}")
        return []


def save_messages(messages):
    """Save contact inquiries."""
    try:
        with open(MESSAGES_LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(messages, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error saving messages: {e}")
        return False


# Configure Flask secret key from config
admin_cfg = load_admin_config()
app.secret_key = admin_cfg.get('secret_key', 'ansari_default_session_secret_2026')

# -----------------------------------------------------------------------------
# Authentication Decorator
# -----------------------------------------------------------------------------

def admin_required(f):
    """Decorator to require admin session authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            if request.is_json or request.path.startswith('/api/admin'):
                return jsonify({
                    "status": "unauthorized",
                    "message": "Admin authentication required."
                }), 401
            return redirect(url_for('secret_admin_login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function


# -----------------------------------------------------------------------------
# Public Routes
# -----------------------------------------------------------------------------

@app.route('/')
def index():
    """Dynamically render the portfolio homepage with live database content."""
    data = load_portfolio_data()
    return render_template(
        'index.html',
        profile=data.get('profile', {}),
        metrics=data.get('metrics', []),
        stats=data.get('stats', []),
        about_cards=data.get('about_cards', []),
        skills=data.get('skills', []),
        projects=data.get('projects', []),
        certificates=data.get('certificates', []),
        timeline=data.get('timeline', [])
    )


@app.route('/resume/<path:filename>')
def serve_resume(filename):
    """Serve documents from the resume directory."""
    resume_dir = os.path.join(BASE_DIR, 'resume')
    return send_from_directory(resume_dir, filename)


@app.route('/favicon.ico')
@app.route('/favicon-32x32.png')
@app.route('/favicon-16x16.png')
@app.route('/apple-touch-icon.png')
@app.route('/site.webmanifest')
@app.route('/android-chrome-192x192.png')
@app.route('/android-chrome-512x512.png')
def serve_favicons():
    """Serve favicon and webmanifest assets from the root directory."""
    filename = request.path.lstrip('/')
    return send_from_directory(BASE_DIR, filename)


@app.route('/api/profile', methods=['GET'])
def get_public_profile():
    """Public JSON API returning current profile and projects."""
    data = load_portfolio_data()
    return jsonify({
        "status": "success",
        "data": data
    }), 200


@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """
    Handle contact form submissions from visitors.
    Validates input and appends to messages list.
    """
    try:
        if request.is_json:
            data = request.get_json() or {}
        else:
            data = request.form.to_dict()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not message:
            return jsonify({
                "status": "error",
                "message": "Name, Email, and Message are required."
            }), 400

        record = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "name": name,
            "email": email,
            "message": message,
            "ip": request.remote_addr
        }

        messages = load_messages()
        messages.append(record)
        save_messages(messages)

        logger.info(f"New contact submission from {name} <{email}>")

        return jsonify({
            "status": "success",
            "message": f"Thank you, {name}! Your message has been received successfully."
        }), 200

    except Exception as e:
        logger.error(f"Error in contact submission: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal error processing message."
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Server health check."""
    return jsonify({
        "status": "healthy",
        "service": "Ansari Portfolio & Dynamic CMS",
        "version": "2.1.0",
        "timestamp": datetime.now().isoformat()
    }), 200


# -----------------------------------------------------------------------------
# Secret Admin Authentication Routes
# -----------------------------------------------------------------------------

@app.route('/secret-admin', methods=['GET'])
@app.route('/admin/login', methods=['GET'])
def secret_admin_login():
    """Render the secret admin login portal."""
    if session.get('is_admin'):
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html', error=None)


@app.route('/admin/login', methods=['POST'])
def handle_admin_login():
    """Verify admin username & password and establish secure session."""
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    cfg = load_admin_config()
    valid_user = (username == cfg.get('username') or username == 'admin')
    valid_pwd = check_password_hash(cfg.get('password_hash', ''), password)

    if valid_user and valid_pwd:
        session['is_admin'] = True
        session['admin_user'] = username
        logger.info(f"Admin '{username}' successfully logged in from {request.remote_addr}")
        return redirect(url_for('admin_dashboard'))
    
    logger.warning(f"Failed admin login attempt for '{username}' from {request.remote_addr}")
    return render_template(
        'admin_login.html',
        error="Invalid admin credentials. Access restricted."
    ), 401


@app.route('/admin/logout', methods=['GET'])
def admin_logout():
    """Sign out admin and clear session."""
    session.clear()
    return redirect(url_for('index'))


# -----------------------------------------------------------------------------
# Secret Admin Dashboard Route
# -----------------------------------------------------------------------------

@app.route('/admin')
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    """Render the full Dynamic Admin Dashboard."""
    data = load_portfolio_data()
    messages = load_messages()
    return render_template(
        'admin.html',
        profile=data.get('profile', {}),
        metrics=data.get('metrics', []),
        stats=data.get('stats', []),
        about_cards=data.get('about_cards', []),
        skills=data.get('skills', []),
        projects=data.get('projects', []),
        certificates=data.get('certificates', []),
        timeline=data.get('timeline', []),
        messages=messages
    )


# -----------------------------------------------------------------------------
# Admin RESTful CRUD APIs
# -----------------------------------------------------------------------------

@app.route('/api/admin/profile', methods=['POST'])
@admin_required
def api_update_profile():
    """Update profile details, dynamic typing roles, and contact info."""
    data = load_portfolio_data()
    req = request.get_json() or {}

    profile = data.setdefault('profile', {})
    for key in ['name', 'eyebrow', 'status_text', 'description', 'email', 'github', 'linkedin', 'address', 'education']:
        if key in req:
            profile[key] = req[key]

    if 'role_typing' in req and isinstance(req['role_typing'], list):
        profile['role_typing'] = [r for r in req['role_typing'] if r]

    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Profile updated successfully."})


@app.route('/api/admin/projects', methods=['POST'])
@admin_required
def api_save_project():
    """Add new project or update existing project."""
    data = load_portfolio_data()
    projects = data.setdefault('projects', [])
    req = request.get_json() or {}

    proj_id = req.get('id', '').strip()
    if proj_id:
        # Edit existing
        for p in projects:
            if p.get('id') == proj_id:
                p.update({
                    "title": req.get('title', p.get('title')),
                    "kicker": req.get('kicker', p.get('kicker', '')),
                    "badge": req.get('badge', p.get('badge', '')),
                    "description": req.get('description', p.get('description', '')),
                    "tech_tags": req.get('tech_tags', p.get('tech_tags', [])),
                    "github_url": req.get('github_url', p.get('github_url', '')),
                    "demo_url": req.get('demo_url', p.get('demo_url', ''))
                })
                break
    else:
        # Add new
        new_project = {
            "id": f"proj_{uuid.uuid4().hex[:8]}",
            "title": req.get('title', 'New Project'),
            "kicker": req.get('kicker', 'Featured Work'),
            "badge": req.get('badge', ''),
            "badge_icon": "fa-solid fa-star",
            "description": req.get('description', ''),
            "tech_tags": req.get('tech_tags', []),
            "github_url": req.get('github_url', ''),
            "demo_url": req.get('demo_url', ''),
            "visual_class": "project-visual-fuelmate",
            "screenshot_label": req.get('title', 'Project Preview')
        }
        projects.insert(0, new_project)

    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Project saved successfully."})


@app.route('/api/admin/projects/<proj_id>', methods=['DELETE'])
@admin_required
def api_delete_project(proj_id):
    """Delete a project by ID."""
    data = load_portfolio_data()
    projects = data.setdefault('projects', [])
    data['projects'] = [p for p in projects if p.get('id') != proj_id]
    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Project deleted successfully."})


@app.route('/api/admin/skills', methods=['POST'])
@admin_required
def api_add_skill():
    """Add a new technical skill."""
    data = load_portfolio_data()
    skills = data.setdefault('skills', [])
    req = request.get_json() or {}

    name = req.get('name', '').strip()
    category = req.get('category', 'backend').strip()
    icon = req.get('icon', 'fa-solid fa-bolt').strip()

    if not name:
        return jsonify({"status": "error", "message": "Skill name is required."}), 400

    new_skill = {
        "id": f"sk_{uuid.uuid4().hex[:8]}",
        "category": category,
        "name": name,
        "icon": icon
    }
    skills.append(new_skill)
    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Skill added successfully.", "skill": new_skill})


@app.route('/api/admin/skills/<skill_id>', methods=['DELETE'])
@admin_required
def api_delete_skill(skill_id):
    """Delete a skill by ID."""
    data = load_portfolio_data()
    skills = data.setdefault('skills', [])
    data['skills'] = [s for s in skills if s.get('id') != skill_id]
    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Skill removed successfully."})


@app.route('/api/admin/certificates', methods=['POST'])
@admin_required
def api_save_certificate():
    """Add or edit a certificate."""
    data = load_portfolio_data()
    certs = data.setdefault('certificates', [])
    req = request.get_json() or {}

    cert_id = req.get('id', '').strip()
    if cert_id:
        for c in certs:
            if c.get('id') == cert_id:
                c.update({
                    "title": req.get('title', c.get('title')),
                    "issuer": req.get('issuer', c.get('issuer')),
                    "year": req.get('year', c.get('year')),
                    "preview": req.get('preview', c.get('preview'))
                })
                break
    else:
        new_cert = {
            "id": f"cert_{uuid.uuid4().hex[:8]}",
            "title": req.get('title', 'New Certificate'),
            "issuer": req.get('issuer', 'Certification Body'),
            "year": req.get('year', str(datetime.now().year)),
            "preview": req.get('preview', 'assets/images/MS-Office.png')
        }
        certs.append(new_cert)

    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Certificate saved successfully."})


@app.route('/api/admin/certificates/<cert_id>', methods=['DELETE'])
@admin_required
def api_delete_certificate(cert_id):
    """Delete a certificate by ID."""
    data = load_portfolio_data()
    certs = data.setdefault('certificates', [])
    data['certificates'] = [c for c in certs if c.get('id') != cert_id]
    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Certificate deleted successfully."})


@app.route('/api/admin/timeline', methods=['POST'])
@admin_required
def api_save_timeline():
    """Add or edit a timeline milestone."""
    data = load_portfolio_data()
    timeline = data.setdefault('timeline', [])
    req = request.get_json() or {}

    tl_id = req.get('id', '').strip()
    if tl_id:
        for t in timeline:
            if t.get('id') == tl_id:
                t.update({
                    "year": req.get('year', t.get('year')),
                    "title": req.get('title', t.get('title')),
                    "description": req.get('description', t.get('description'))
                })
                break
    else:
        new_item = {
            "id": f"time_{uuid.uuid4().hex[:8]}",
            "year": req.get('year', str(datetime.now().year)),
            "title": req.get('title', 'Milestone Title'),
            "description": req.get('description', '')
        }
        timeline.append(new_item)

    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Milestone saved successfully."})


@app.route('/api/admin/timeline/<tl_id>', methods=['DELETE'])
@admin_required
def api_delete_timeline(tl_id):
    """Delete a timeline milestone by ID."""
    data = load_portfolio_data()
    timeline = data.setdefault('timeline', [])
    data['timeline'] = [t for t in timeline if t.get('id') != tl_id]
    save_portfolio_data(data)
    return jsonify({"status": "success", "message": "Milestone deleted successfully."})


@app.route('/api/admin/stats', methods=['POST'])
@admin_required
def api_update_stats():
    """Update stats counter values."""
    data = load_portfolio_data()
    req = request.get_json() or {}
    stats_list = req.get('stats', [])

    if stats_list:
        data['stats'] = stats_list
        save_portfolio_data(data)

    return jsonify({"status": "success", "message": "Statistics updated successfully."})


@app.route('/api/admin/messages', methods=['GET'])
@admin_required
def api_list_messages():
    """Get all messages."""
    return jsonify({"status": "success", "messages": load_messages()})


@app.route('/api/admin/messages/<timestamp>', methods=['DELETE'])
@admin_required
def api_delete_message(timestamp):
    """Delete an inquiry message by timestamp or ID."""
    messages = load_messages()
    messages = [m for m in messages if m.get('timestamp') != timestamp and m.get('id') != timestamp]
    save_messages(messages)
    return jsonify({"status": "success", "message": "Message deleted."})


@app.route('/api/admin/change-password', methods=['POST'])
@admin_required
def api_change_password():
    """Update admin secret password."""
    req = request.get_json() or {}
    curr_pwd = req.get('current_password', '').strip()
    new_pwd = req.get('new_password', '').strip()

    if not curr_pwd or not new_pwd:
        return jsonify({"status": "error", "message": "All password fields are required."}), 400

    cfg = load_admin_config()
    if not check_password_hash(cfg.get('password_hash', ''), curr_pwd):
        return jsonify({"status": "error", "message": "Current password is incorrect."}), 400

    cfg['password_hash'] = generate_password_hash(new_pwd)
    save_admin_config(cfg)
    logger.info("Admin password changed successfully.")
    return jsonify({"status": "success", "message": "Password updated successfully."})


# -----------------------------------------------------------------------------
# Terminal Banner & Entry Point
# -----------------------------------------------------------------------------

def print_banner(host, port):
    """Print a clean, cross-platform terminal banner on startup."""
    banner = f"""
====================================================================
  [*] ANSARI MOHAMMED SAMEER - DYNAMIC PORTFOLIO & CMS SERVER
====================================================================
  [+] Live Website:     http://{host}:{port}
  [+] Secret Admin:     http://{host}:{port}/secret-admin
  [+] Project Path:     {BASE_DIR}
  [+] Default Admin:    Username: sameer | Password: sameer@ansari2026
====================================================================
    Press CTRL+C to stop the server
====================================================================
"""
    try:
        print(banner, flush=True)
    except UnicodeEncodeError:
        # Fallback to pure ascii encoding if needed
        print(banner.encode('ascii', 'ignore').decode('ascii'), flush=True)


if __name__ == '__main__':
    # Ensure UTF-8 output on Windows console
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except Exception:
            pass

    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')

    print_banner(host, port)
    app.run(host=host, port=port, debug=debug)
