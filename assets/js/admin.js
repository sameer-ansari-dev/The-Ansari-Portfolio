/**
 * Ansari Mohammed Sameer - Admin Dashboard Client JavaScript
 * Tab Management, AJAX CRUD Endpoints & Interactive Modals
 */

// Toast Notifications
function showAdminToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
  toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Tab Switching
function switchTab(tabId) {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const panes = document.querySelectorAll('.admin-tab-pane');
  const pageTitle = document.getElementById('page-title');

  panes.forEach(p => p.classList.remove('is-active'));
  navItems.forEach(n => n.classList.remove('is-active'));

  const targetPane = document.getElementById(tabId);
  const targetNav = document.querySelector(`[data-tab="${tabId}"]`);

  if (targetPane) targetPane.classList.add('is-active');
  if (targetNav) {
    targetNav.classList.add('is-active');
    if (pageTitle) {
      const label = targetNav.querySelector('span')?.textContent || 'Dashboard';
      pageTitle.textContent = label;
    }
  }

  // Close mobile sidebar on tab click
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar && window.innerWidth <= 992) {
    sidebar.classList.remove('is-open');
  }
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('is-open');
  setTimeout(() => { modal.hidden = true; }, 200);
}

// Global Document Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
    });
  }

  // Sidebar Tab Click Listeners
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Modal Backdrop Close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m.id));
    }
  });

  /* --------------------------------------------------------------------------
     1. Profile Form Handler
     -------------------------------------------------------------------------- */
  const profileForm = document.getElementById('form-profile');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      const data = Object.fromEntries(formData.entries());

      // Split typing roles by newline
      data.role_typing = (data.role_typing || '')
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      try {
        const res = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Profile updated successfully!', 'success');
        } else {
          showAdminToast(result.message || 'Failed to update profile', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while saving profile', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. Project Form Handler
     -------------------------------------------------------------------------- */
  const projectForm = document.getElementById('form-project-modal');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(projectForm);
      const data = Object.fromEntries(formData.entries());

      data.tech_tags = (data.tech_tags || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      try {
        const res = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Project saved successfully!', 'success');
          closeModal('modal-project');
          setTimeout(() => location.reload(), 600);
        } else {
          showAdminToast(result.message || 'Error saving project', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while saving project', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. Skill Form Handler
     -------------------------------------------------------------------------- */
  const skillForm = document.getElementById('form-skill-modal');
  if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(skillForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Skill added successfully!', 'success');
          closeModal('modal-skill');
          setTimeout(() => location.reload(), 600);
        } else {
          showAdminToast(result.message || 'Error adding skill', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while adding skill', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. Certificate Form Handler
     -------------------------------------------------------------------------- */
  const certForm = document.getElementById('form-cert-modal');
  if (certForm) {
    certForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(certForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/admin/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Certificate saved successfully!', 'success');
          closeModal('modal-cert');
          setTimeout(() => location.reload(), 600);
        } else {
          showAdminToast(result.message || 'Error saving certificate', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while saving certificate', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. Timeline Form Handler
     -------------------------------------------------------------------------- */
  const timelineForm = document.getElementById('form-timeline-modal');
  if (timelineForm) {
    timelineForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(timelineForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/admin/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Milestone saved successfully!', 'success');
          closeModal('modal-timeline');
          setTimeout(() => location.reload(), 600);
        } else {
          showAdminToast(result.message || 'Error saving milestone', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while saving milestone', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. Stats Form Handler
     -------------------------------------------------------------------------- */
  const statsForm = document.getElementById('form-stats');
  if (statsForm) {
    statsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(statsForm);
      const statsArray = [];

      for (let i = 0; i < 4; i++) {
        statsArray.push({
          id: `stat_${i + 1}`,
          count: Number(formData.get(`stat_count_${i}`)),
          label: formData.get(`stat_label_${i}`),
          detail: formData.get(`stat_detail_${i}`),
          icon: formData.get(`stat_icon_${i}`),
        });
      }

      try {
        const res = await fetch('/api/admin/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stats: statsArray }),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Statistics saved successfully!', 'success');
        } else {
          showAdminToast(result.message || 'Error saving stats', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while saving stats', 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. Password Change Form Handler
     -------------------------------------------------------------------------- */
  const pwdForm = document.getElementById('form-password');
  if (pwdForm) {
    pwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const current_password = document.getElementById('current-pwd').value;
      const new_password = document.getElementById('new-pwd').value;
      const confirm_password = document.getElementById('confirm-pwd').value;

      if (new_password !== confirm_password) {
        showAdminToast('New passwords do not match.', 'error');
        return;
      }

      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_password, new_password }),
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          showAdminToast('Password updated successfully! Keep it safe.', 'success');
          pwdForm.reset();
        } else {
          showAdminToast(result.message || 'Failed to update password', 'error');
        }
      } catch (err) {
        showAdminToast('Network error while changing password', 'error');
      }
    });
  }
});

/* --------------------------------------------------------------------------
   Interactive Modal Openers & Deletion Handlers
   -------------------------------------------------------------------------- */

// Project Modals
function openProjectModal() {
  const form = document.getElementById('form-project-modal');
  if (form) form.reset();
  document.getElementById('proj-id').value = '';
  document.getElementById('modal-project-title').textContent = 'Add New Project';
  openModal('modal-project');
}

function editProject(p) {
  document.getElementById('proj-id').value = p.id || '';
  document.getElementById('proj-title').value = p.title || '';
  document.getElementById('proj-kicker').value = p.kicker || '';
  document.getElementById('proj-badge').value = p.badge || '';
  document.getElementById('proj-tags').value = (p.tech_tags || []).join(', ');
  document.getElementById('proj-desc').value = p.description || '';
  document.getElementById('proj-github').value = p.github_url || '';
  document.getElementById('proj-demo').value = p.demo_url || '';
  document.getElementById('modal-project-title').textContent = `Edit Project: ${p.title}`;
  openModal('modal-project');
}

async function deleteProject(id, title) {
  if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showAdminToast(`Project "${title}" deleted.`, 'success');
      document.querySelector(`tr[data-id="${id}"]`)?.remove();
    } else {
      showAdminToast(result.message || 'Failed to delete project', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting project', 'error');
  }
}

// Skill Modals
function openSkillModal() {
  const form = document.getElementById('form-skill-modal');
  if (form) form.reset();
  openModal('modal-skill');
}

async function deleteSkill(id, name) {
  if (!confirm(`Remove skill "${name}"?`)) return;

  try {
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showAdminToast(`Skill "${name}" removed.`, 'success');
      setTimeout(() => location.reload(), 400);
    } else {
      showAdminToast(result.message || 'Failed to delete skill', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting skill', 'error');
  }
}

// Certificate Modals
function openCertModal() {
  const form = document.getElementById('form-cert-modal');
  if (form) form.reset();
  document.getElementById('cert-id').value = '';
  document.getElementById('modal-cert-title').textContent = 'Add Certificate';
  openModal('modal-cert');
}

function editCert(c) {
  document.getElementById('cert-id').value = c.id || '';
  document.getElementById('cert-title-input').value = c.title || '';
  document.getElementById('cert-issuer-input').value = c.issuer || '';
  document.getElementById('cert-year-input').value = c.year || '';
  document.getElementById('cert-preview-input').value = c.preview || '';
  document.getElementById('modal-cert-title').textContent = `Edit Certificate: ${c.title}`;
  openModal('modal-cert');
}

async function deleteCert(id, title) {
  if (!confirm(`Delete certificate "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showAdminToast(`Certificate "${title}" deleted.`, 'success');
      document.querySelector(`.cert-admin-card[data-id="${id}"]`)?.remove();
    } else {
      showAdminToast(result.message || 'Failed to delete certificate', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting certificate', 'error');
  }
}

// Timeline Modals
function openTimelineModal() {
  const form = document.getElementById('form-timeline-modal');
  if (form) form.reset();
  document.getElementById('tl-id').value = '';
  document.getElementById('modal-timeline-title').textContent = 'Add Milestone';
  openModal('modal-timeline');
}

function editTimeline(t) {
  document.getElementById('tl-id').value = t.id || '';
  document.getElementById('tl-year').value = t.year || '';
  document.getElementById('tl-title').value = t.title || '';
  document.getElementById('tl-desc').value = t.description || '';
  document.getElementById('modal-timeline-title').textContent = `Edit Milestone (${t.year})`;
  openModal('modal-timeline');
}

async function deleteTimeline(id) {
  if (!confirm('Delete this timeline milestone?')) return;

  try {
    const res = await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showAdminToast('Milestone deleted.', 'success');
      document.querySelector(`.timeline-admin-item[data-id="${id}"]`)?.remove();
    } else {
      showAdminToast(result.message || 'Failed to delete milestone', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting milestone', 'error');
  }
}

// Message Deletion
async function deleteMessage(timestamp) {
  if (!confirm('Delete this visitor message?')) return;

  try {
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(timestamp)}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showAdminToast('Message deleted.', 'success');
      document.querySelector(`tr[data-id="${timestamp}"]`)?.remove();
    } else {
      showAdminToast(result.message || 'Failed to delete message', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting message', 'error');
  }
}
