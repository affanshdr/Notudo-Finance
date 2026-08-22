/* ═══════════════════════════════════════════════════════════════════════════
   NOTUDO FINANCE — INTERACTIVE FLOW STUDIO ENGINE
   Core logic for Drag and Drop, SVG Bezier Connection Engine, Flow Simulation,
   Properties Inspector, and JSON Persistence.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── PRESET NOTUDO PIPELINE DATA ──
  const INITIAL_PRESET_NODES = [
    {
      id: 'node-login',
      type: 'login',
      title: 'Step 1 · Login Stockbit',
      file: 'pipeline/login.ipynb',
      theme: 'purple',
      icon: '🔐',
      status: 'idle',
      desc: 'Inisialisasi Edge WebDriver dengan profil Stockbit khusus. Login manual via browser satu kali, sesi tersimpan.',
      tags: ['Python', 'Selenium', 'Edge'],
      x: 150,
      y: 120
    },
    {
      id: 'node-listco',
      type: 'listco',
      title: 'Step 2 · Scraping Daftar Emiten',
      file: 'pipeline/scrap-list-perusahaan.ipynb',
      theme: 'teal',
      icon: '📋',
      status: 'idle',
      desc: 'Loop 10 sektor × sub-sektor di Stockbit dengan virtual scroll trick (scrollIntoView). Output: Perusahaan.csv (826 emiten).',
      tags: ['Selenium', 'Pandas', 'CSV'],
      x: 150,
      y: 340
    },
    {
      id: 'node-harga',
      type: 'harga',
      title: 'Step 3 · Scraping Harga Saham',
      file: 'pipeline/scrap-all-harga.ipynb',
      theme: 'amber',
      icon: '💹',
      status: 'idle',
      desc: 'Download data OHLCV historis semua 775 emiten dari Yahoo Finance/Stockbit. Simpan per-ticker di Dataset/[KODE].JK.csv.',
      tags: ['Python', 'Pandas', '775 CSVs'],
      x: 150,
      y: 560
    },
    {
      id: 'node-broker',
      type: 'broker',
      title: 'Step 4 · Scraping Broker Summary',
      file: 'pipeline/scrap-broker-summary.ipynb',
      theme: 'rose',
      icon: '📊',
      status: 'idle',
      desc: 'Loop 775 ticker di Stockbit. Navigasi tanggal mundur. Auto-pause koneksi, validasi kode broker, dan append kolom ke CSV.',
      tags: ['Selenium', 'Stockbit', 'Append CSV'],
      x: 550,
      y: 120
    },
    {
      id: 'node-update',
      type: 'update',
      title: 'Step 5 · Update Existing CSVs',
      file: 'pipeline/update_existing_csvs.py',
      theme: 'sky',
      icon: '🔄',
      status: 'idle',
      desc: 'Tambah kolom Sektor & Sub_Sektor ke semua CSV dari mapping Perusahaan.csv. Sisipkan setelah kolom Volume.',
      tags: ['Python', 'Bulk Update'],
      x: 550,
      y: 340
    },
    {
      id: 'node-verifikasi',
      type: 'verifikasi',
      title: 'Step 6 · Verifikasi Data',
      file: 'pipeline/test-read.ipynb',
      theme: 'green',
      icon: '🧪',
      status: 'idle',
      desc: 'Notebook untuk membaca & verifikasi data hasil scraping. Cek kelengkapan kolom, struktur CSV, dan integritas dataset.',
      tags: ['Python', 'Pandas', 'Validation'],
      x: 550,
      y: 560
    }
  ];

  const INITIAL_PRESET_LINKS = [
    { id: 'link-1', from: 'node-login', to: 'node-listco' },
    { id: 'link-2', from: 'node-listco', to: 'node-harga' },
    { id: 'link-3', from: 'node-harga', to: 'node-broker' },
    { id: 'link-4', from: 'node-broker', to: 'node-update' },
    { id: 'link-5', from: 'node-update', to: 'node-verifikasi' }
  ];

  // ── APP STATE ──
  let state = {
    nodes: [],
    links: [],
    selectedNodeId: null,
    panX: 40,
    panY: 20,
    zoom: 0.85,
    isSimulating: false,
    simSpeed: 2
  };

  // ── DOM ELEMENTS ──
  const canvasContainer = document.getElementById('canvas-container');
  const canvasWorld = document.getElementById('canvas-world');
  const nodesContainer = document.getElementById('nodes-container');
  const svgConnections = document.getElementById('svg-connections');
  const wiresGroup = document.getElementById('wires-group');
  const dragWirePath = document.getElementById('drag-wire');
  const zoomLevelEl = document.getElementById('zoom-level');

  const sidebarInspector = document.getElementById('sidebar-inspector');
  const inspectorContent = document.getElementById('inspector-content');
  const inspectorForm = document.getElementById('inspector-form');
  const emptyStateInspector = inspectorContent.querySelector('.empty-state');

  // Inspector Form Inputs
  const inpNodeTitle = document.getElementById('inp-node-title');
  const inpNodeFile = document.getElementById('inp-node-file');
  const inpNodeTheme = document.getElementById('inp-node-theme');
  const inpNodeStatus = document.getElementById('inp-node-status');
  const inpNodeDesc = document.getElementById('inp-node-desc');
  const inpNodeTags = document.getElementById('inp-node-tags');

  // Stats Counters
  const countNodesEl = document.getElementById('count-nodes');
  const countLinksEl = document.getElementById('count-links');
  const simStatusBadge = document.getElementById('simulation-status-badge');

  // ── INITIALIZATION ──
  function init() {
    loadSavedState();
    setupCanvasControls();
    setupDragAndDropPalette();
    setupPortWiring();
    setupInspectorEvents();
    setupHeaderEvents();

    renderAll();
  }

  // ── LOCAL STORAGE PERSISTENCE ──
  function loadSavedState() {
    const saved = localStorage.getItem('notudo_flow_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.nodes = parsed.nodes || [];
        state.links = parsed.links || [];
        state.panX = parsed.panX || 40;
        state.panY = parsed.panY || 20;
        state.zoom = parsed.zoom || 0.85;
      } catch (e) {
        resetToPreset();
      }
    } else {
      resetToPreset();
    }
  }

  function saveState() {
    localStorage.setItem('notudo_flow_state', JSON.stringify({
      nodes: state.nodes,
      links: state.links,
      panX: state.panX,
      panY: state.panY,
      zoom: state.zoom
    }));
    updateCounters();
  }

  function resetToPreset() {
    state.nodes = JSON.parse(JSON.stringify(INITIAL_PRESET_NODES));
    state.links = JSON.parse(JSON.stringify(INITIAL_PRESET_LINKS));
    state.selectedNodeId = null;
    state.panX = 60;
    state.panY = 30;
    state.zoom = 0.85;
    saveState();
    renderAll();
    toast('Diagram alur Notudo Finance berhasil di-reset!');
  }

  // ── RENDER ENGINE ──
  function renderAll() {
    applyTransform();
    renderNodes();
    renderWires();
    updateCounters();
    updateInspectorForm();
  }

  function applyTransform() {
    canvasWorld.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    zoomLevelEl.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function updateCounters() {
    countNodesEl.textContent = state.nodes.length;
    countLinksEl.textContent = state.links.length;
  }

  // ── RENDER NODES ──
  function renderNodes() {
    nodesContainer.innerHTML = '';

    state.nodes.forEach(node => {
      const el = document.createElement('div');
      el.className = `flow-node ${node.theme || 'purple'} ${node.id === state.selectedNodeId ? 'selected' : ''} status-${node.status || 'idle'}`;
      el.id = node.id;
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;

      el.innerHTML = `
        <div class="port port-input" data-node-id="${node.id}" data-port-type="input" title="Input Port (Tarik dari node lain)"></div>

        <div class="node-header">
          <div class="node-title-group">
            <span class="node-icon">${node.icon || '📦'}</span>
            <span class="node-title">${escapeHtml(node.title)}</span>
          </div>
          <div class="node-actions">
            <button class="btn-icon btn-edit-node" data-id="${node.id}" title="Edit Properti">✏️</button>
            <button class="btn-icon btn-del-node" data-id="${node.id}" title="Hapus Node">🗑️</button>
          </div>
        </div>

        ${node.file ? `<div class="node-file">${escapeHtml(node.file)}</div>` : ''}
        ${node.desc ? `<div class="node-desc">${escapeHtml(node.desc)}</div>` : ''}

        <div class="node-footer">
          <span class="node-status-tag ${node.status}">${node.status || 'idle'}</span>
          <div class="node-tags-list">
            ${(node.tags || []).map(tag => `<span class="node-tag-pill">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>

        <div class="port port-output" data-node-id="${node.id}" data-port-type="output" title="Output Port (Tarik ke node selanjutnya)"></div>
      `;

      // Node Selection & Dragging
      el.addEventListener('mousedown', (e) => onNodeMouseDown(e, node));

      // Node Action Buttons
      el.querySelector('.btn-edit-node').addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node.id);
      });

      el.querySelector('.btn-del-node').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNode(node.id);
      });

      nodesContainer.appendChild(el);
    });
  }

  // ── RENDER SVG WIRES / CONNECTIONS ──
  function renderWires() {
    wiresGroup.innerHTML = '';

    state.links.forEach(link => {
      const fromNode = state.nodes.find(n => n.id === link.from);
      const toNode = state.nodes.find(n => n.id === link.to);

      if (!fromNode || !toNode) return;

      const p1 = getNodePortCoords(fromNode, 'output');
      const p2 = getNodePortCoords(toNode, 'input');

      const d = getBezierPath(p1.x, p1.y, p2.x, p2.y);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'wire-path');
      path.setAttribute('d', d);
      path.setAttribute('data-link-id', link.id);
      path.setAttribute('marker-end', 'url(#marker-arrow)');

      // Click to select or delete link
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Hapus koneksi garis ini?')) {
          deleteLink(link.id);
        }
      });

      wiresGroup.appendChild(path);
    });
  }

  function getNodePortCoords(node, type) {
    const nodeEl = document.getElementById(node.id);
    const width = nodeEl ? nodeEl.offsetWidth : 240;
    const height = nodeEl ? nodeEl.offsetHeight : 120;

    if (type === 'output') {
      return { x: node.x + width / 2, y: node.y + height + 7 };
    } else {
      return { x: node.x + width / 2, y: node.y - 7 };
    }
  }

  function getBezierPath(x1, y1, x2, y2) {
    const dy = Math.abs(y2 - y1) * 0.5;
    const cy1 = y1 + Math.max(dy, 50);
    const cy2 = y2 - Math.max(dy, 50);
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }

  // ── CANVAS PAN & ZOOM SYSTEM ──
  function setupCanvasControls() {
    let isPanning = false;
    let startX = 0, startY = 0;

    canvasContainer.addEventListener('mousedown', (e) => {
      if (e.target === canvasContainer || e.target === canvasWorld || e.target.id === 'canvas-grid' || e.target.tagName === 'svg') {
        isPanning = true;
        startX = e.clientX - state.panX;
        startY = e.clientY - state.panY;
        canvasContainer.classList.add('panning');
        deselectNode();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        state.panX = e.clientX - startX;
        state.panY = e.clientY - startY;
        applyTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        canvasContainer.classList.remove('panning');
        saveState();
      }
    });

    // Zoom on Wheel around Cursor
    canvasContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      const newZoom = Math.min(2.0, Math.max(0.25, state.zoom + delta));

      const rect = canvasContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      state.panX = mouseX - (mouseX - state.panX) * (newZoom / state.zoom);
      state.panY = mouseY - (mouseY - state.panY) * (newZoom / state.zoom);
      state.zoom = newZoom;

      applyTransform();
      saveState();
    }, { passive: false });

    // Floating Zoom Controls Buttons
    document.getElementById('btn-zoom-in').onclick = () => {
      state.zoom = Math.min(2.0, state.zoom + 0.15);
      applyTransform();
      saveState();
    };

    document.getElementById('btn-zoom-out').onclick = () => {
      state.zoom = Math.max(0.25, state.zoom - 0.15);
      applyTransform();
      saveState();
    };

    document.getElementById('btn-zoom-fit').onclick = () => {
      state.zoom = 0.85;
      state.panX = 60;
      state.panY = 30;
      applyTransform();
      saveState();
    };
  }

  // ── NODE DRAGGING LOGIC ──
  function onNodeMouseDown(e, node) {
    if (e.button !== 0 || e.target.classList.contains('port') || e.target.classList.contains('btn-icon')) return;

    e.stopPropagation();
    selectNode(node.id);

    const nodeEl = document.getElementById(node.id);
    nodeEl.classList.add('dragging');

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initialNodeX = node.x;
    const initialNodeY = node.y;

    function onMouseMove(moveEvent) {
      const dx = (moveEvent.clientX - startMouseX) / state.zoom;
      const dy = (moveEvent.clientY - startMouseY) / state.zoom;

      node.x = Math.round(initialNodeX + dx);
      node.y = Math.round(initialNodeY + dy);

      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;

      renderWires();
    }

    function onMouseUp() {
      nodeEl.classList.remove('dragging');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      saveState();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // ── PORT WIRING / CONNECTION DRAGGING ──
  function setupPortWiring() {
    let wiringSourceNodeId = null;

    document.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('port-output')) {
        e.stopPropagation();
        wiringSourceNodeId = e.target.dataset.nodeId;
        dragWirePath.style.display = 'block';

        const sourceNode = state.nodes.find(n => n.id === wiringSourceNodeId);
        const p1 = getNodePortCoords(sourceNode, 'output');

        function onWiringMove(moveEvent) {
          const rect = canvasContainer.getBoundingClientRect();
          const targetWorldX = (moveEvent.clientX - rect.left - state.panX) / state.zoom;
          const targetWorldY = (moveEvent.clientY - rect.top - state.panY) / state.zoom;

          const d = getBezierPath(p1.x, p1.y, targetWorldX, targetWorldY);
          dragWirePath.setAttribute('d', d);
        }

        function onWiringUp(upEvent) {
          dragWirePath.style.display = 'none';
          window.removeEventListener('mousemove', onWiringMove);
          window.removeEventListener('mouseup', onWiringUp);

          const targetPort = upEvent.target;
          if (targetPort && targetPort.classList.contains('port-input')) {
            const targetNodeId = targetPort.dataset.nodeId;
            if (targetNodeId && targetNodeId !== wiringSourceNodeId) {
              createLink(wiringSourceNodeId, targetNodeId);
            }
          }
          wiringSourceNodeId = null;
        }

        window.addEventListener('mousemove', onWiringMove);
        window.addEventListener('mouseup', onWiringUp);
      }
    });
  }

  function createLink(fromId, toId) {
    const existing = state.links.find(l => l.from === fromId && l.to === toId);
    if (existing) {
      toast('Koneksi antar node tersebut sudah ada!');
      return;
    }

    const newLink = {
      id: `link-${Date.now()}`,
      from: fromId,
      to: toId
    };

    state.links.push(newLink);
    saveState();
    renderWires();
    toast('Koneksi alur berhasil ditambahkan!');
  }

  function deleteLink(linkId) {
    state.links = state.links.filter(l => l.id !== linkId);
    saveState();
    renderWires();
    toast('Koneksi alur dihapus.');
  }

  // ── DRAG AND DROP FROM SIDEBAR PALETTE ──
  function setupDragAndDropPalette() {
    const paletteItems = document.querySelectorAll('.palette-item');

    paletteItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: item.dataset.type,
          name: item.querySelector('.item-name').textContent,
          sub: item.querySelector('.item-sub').textContent,
          icon: item.querySelector('.item-icon').textContent,
          theme: item.classList.contains('purple') ? 'purple' :
                 item.classList.contains('teal') ? 'teal' :
                 item.classList.contains('amber') ? 'amber' :
                 item.classList.contains('rose') ? 'rose' :
                 item.classList.contains('sky') ? 'sky' :
                 item.classList.contains('green') ? 'green' :
                 item.classList.contains('indigo') ? 'indigo' : 'cyan'
        }));
      });
    });

    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;

      const data = JSON.parse(rawData);
      const rect = canvasContainer.getBoundingClientRect();

      const dropWorldX = Math.round((e.clientX - rect.left - state.panX) / state.zoom - 110);
      const dropWorldY = Math.round((e.clientY - rect.top - state.panY) / state.zoom - 40);

      const newNode = {
        id: `node-${Date.now()}`,
        type: data.type,
        title: data.name,
        file: data.sub,
        theme: data.theme,
        icon: data.icon,
        status: 'idle',
        desc: `Alur kerja baru: ${data.name}`,
        tags: [data.type],
        x: Math.max(20, dropWorldX),
        y: Math.max(20, dropWorldY)
      };

      state.nodes.push(newNode);
      saveState();
      renderAll();
      selectNode(newNode.id);
      toast(`Node "${newNode.title}" berhasil ditambahkan!`);
    });

    // Palette Search Filter
    const paletteSearchInput = document.getElementById('palette-search');
    paletteSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      paletteItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  // ── NODE INSPECTOR FORM & SELECTION ──
  function selectNode(nodeId) {
    state.selectedNodeId = nodeId;
    renderNodes();
    updateInspectorForm();
    sidebarInspector.classList.remove('collapsed');
  }

  function deselectNode() {
    state.selectedNodeId = null;
    renderNodes();
    updateInspectorForm();
    sidebarInspector.classList.add('collapsed');
  }

  function updateInspectorForm() {
    const node = state.nodes.find(n => n.id === state.selectedNodeId);

    if (!node) {
      emptyStateInspector.style.display = 'flex';
      inspectorForm.style.display = 'none';
      return;
    }

    emptyStateInspector.style.display = 'none';
    inspectorForm.style.display = 'block';

    inpNodeTitle.value = node.title || '';
    inpNodeFile.value = node.file || '';
    inpNodeTheme.value = node.theme || 'purple';
    inpNodeStatus.value = node.status || 'idle';
    inpNodeDesc.value = node.desc || '';
    inpNodeTags.value = (node.tags || []).join(', ');
  }

  function setupInspectorEvents() {
    document.getElementById('btn-close-inspector').onclick = () => deselectNode();

    // Form inputs change listeners
    [inpNodeTitle, inpNodeFile, inpNodeTheme, inpNodeStatus, inpNodeDesc, inpNodeTags].forEach(inp => {
      inp.addEventListener('input', () => {
        const node = state.nodes.find(n => n.id === state.selectedNodeId);
        if (!node) return;

        node.title = inpNodeTitle.value;
        node.file = inpNodeFile.value;
        node.theme = inpNodeTheme.value;
        node.status = inpNodeStatus.value;
        node.desc = inpNodeDesc.value;
        node.tags = inpNodeTags.value.split(',').map(t => t.trim()).filter(Boolean);

        saveState();
        renderNodes();
      });
    });

    document.getElementById('btn-delete-node').onclick = () => {
      if (state.selectedNodeId) {
        deleteNode(state.selectedNodeId);
      }
    };

    document.getElementById('btn-duplicate-node').onclick = () => {
      const node = state.nodes.find(n => n.id === state.selectedNodeId);
      if (node) {
        const dup = JSON.parse(JSON.stringify(node));
        dup.id = `node-${Date.now()}`;
        dup.title += ' (Copy)';
        dup.x += 40;
        dup.y += 40;

        state.nodes.push(dup);
        saveState();
        renderAll();
        selectNode(dup.id);
        toast(`Node "${dup.title}" telah diduplikat.`);
      }
    };

    document.getElementById('btn-run-single-node').onclick = () => {
      const node = state.nodes.find(n => n.id === state.selectedNodeId);
      if (node) {
        node.status = 'running';
        renderNodes();
        toast(`Menjalankan step: ${node.title}...`);

        setTimeout(() => {
          node.status = 'completed';
          renderNodes();
          toast(`Step ${node.title} selesai dengan sukses!`);
          saveState();
        }, 1200);
      }
    };
  }

  function deleteNode(nodeId) {
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    state.links = state.links.filter(l => l.from !== nodeId && l.to !== nodeId);

    if (state.selectedNodeId === nodeId) {
      deselectNode();
    }

    saveState();
    renderAll();
    toast('Node berhasil dihapus.');
  }

  // ── HEADER ACTIONS & SIMULATION ENGINE ──
  function setupHeaderEvents() {
    document.getElementById('btn-reset-preset').onclick = () => {
      if (confirm('Reset canvas ke alur pipeline Notudo Finance bawaan? Sesuatu yang baru mungkin hilang.')) {
        resetToPreset();
      }
    };

    document.getElementById('btn-add-custom-node').onclick = () => {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        title: 'Custom Workflow Step',
        file: 'script.py',
        theme: 'indigo',
        icon: '🧱',
        status: 'idle',
        desc: 'Langkah alur kerja kustom.',
        tags: ['Custom'],
        x: 300,
        y: 250
      };
      state.nodes.push(newNode);
      saveState();
      renderAll();
      selectNode(newNode.id);
      toast('Node kustom ditambahkan.');
    };

    // JSON Export
    document.getElementById('btn-export-json').onclick = () => {
      const jsonStr = JSON.stringify({ nodes: state.nodes, links: state.links }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notudo-pipeline-workflow.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('File workflow JSON berhasil di-download!');
    };

    // JSON Import
    const fileImportInput = document.getElementById('file-import-input');
    document.getElementById('btn-import-json').onclick = () => fileImportInput.click();

    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          if (Array.isArray(data.nodes) && Array.isArray(data.links)) {
            state.nodes = data.nodes;
            state.links = data.links;
            saveState();
            renderAll();
            toast('Import workflow JSON berhasil!');
          } else {
            alert('Format file JSON tidak valid. Harus memiliki array nodes dan links.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON.');
        }
      };
      reader.readAsText(file);
    });

    // SOP Runbook Modal
    const modalOverlay = document.getElementById('modal-overlay');
    document.getElementById('btn-open-runbook').onclick = () => modalOverlay.classList.add('show');
    document.getElementById('btn-close-modal').onclick = () => modalOverlay.classList.remove('show');
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('show'); };

    // Simulation Execution Engine Controls
    const btnRunSim = document.getElementById('btn-run-sim');
    const btnPauseSim = document.getElementById('btn-pause-sim');
    const simSpeedSelect = document.getElementById('sim-speed');

    simSpeedSelect.onchange = (e) => state.simSpeed = parseFloat(e.target.value);

    btnRunSim.onclick = () => runPipelineSimulation();
    btnPauseSim.onclick = () => pausePipelineSimulation();
  }

  // ── PIPELINE SIMULATION ENGINE ──
  let simTimer = null;

  function runPipelineSimulation() {
    if (state.nodes.length === 0) return;

    state.isSimulating = true;
    document.getElementById('btn-run-sim').disabled = true;
    document.getElementById('btn-pause-sim').disabled = false;
    simStatusBadge.textContent = 'Running';
    simStatusBadge.classList.add('running');

    // Reset all statuses to idle
    state.nodes.forEach(n => n.status = 'idle');
    renderNodes();

    // Determine execution topological order
    const orderedNodes = getTopologicalOrder();
    let stepIndex = 0;

    function step() {
      if (!state.isSimulating || stepIndex >= orderedNodes.length) {
        finishPipelineSimulation();
        return;
      }

      const currentNode = orderedNodes[stepIndex];
      currentNode.status = 'running';
      renderNodes();
      toast(`Executing: ${currentNode.title}`);

      // Animate wires leading into this node if any
      const incomingLinks = state.links.filter(l => l.to === currentNode.id);
      incomingLinks.forEach(link => {
        const wireEl = wiresGroup.querySelector(`path[data-link-id="${link.id}"]`);
        if (wireEl) wireEl.classList.add('active-wire');
      });

      const delay = (1500 / state.simSpeed);

      simTimer = setTimeout(() => {
        currentNode.status = 'completed';
        renderNodes();

        incomingLinks.forEach(link => {
          const wireEl = wiresGroup.querySelector(`path[data-link-id="${link.id}"]`);
          if (wireEl) wireEl.classList.remove('active-wire');
        });

        stepIndex++;
        step();
      }, delay);
    }

    step();
  }

  function pausePipelineSimulation() {
    state.isSimulating = false;
    if (simTimer) clearTimeout(simTimer);

    document.getElementById('btn-run-sim').disabled = false;
    document.getElementById('btn-pause-sim').disabled = true;
    simStatusBadge.textContent = 'Paused';
    simStatusBadge.classList.remove('running');
    toast('Simulasi dipause.');
  }

  function finishPipelineSimulation() {
    state.isSimulating = false;
    document.getElementById('btn-run-sim').disabled = false;
    document.getElementById('btn-pause-sim').disabled = true;
    simStatusBadge.textContent = 'Completed';
    simStatusBadge.classList.remove('running');
    toast('🎉 Simulasi eksekusi seluruh pipeline telah selesai!');
    saveState();
  }

  function getTopologicalOrder() {
    // Simple topological sort or fallback to array order
    const inDegree = {};
    state.nodes.forEach(n => inDegree[n.id] = 0);

    state.links.forEach(l => {
      if (inDegree[l.to] !== undefined) inDegree[l.to]++;
    });

    const queue = state.nodes.filter(n => inDegree[n.id] === 0);
    const result = [];

    while (queue.length > 0) {
      const curr = queue.shift();
      result.push(curr);

      const outgoing = state.links.filter(l => l.from === curr.id);
      outgoing.forEach(l => {
        if (inDegree[l.to] !== undefined) {
          inDegree[l.to]--;
          if (inDegree[l.to] === 0) {
            const nodeObj = state.nodes.find(n => n.id === l.to);
            if (nodeObj && !result.includes(nodeObj)) queue.push(nodeObj);
          }
        }
      });
    }

    // Add any remaining unvisited nodes
    state.nodes.forEach(n => {
      if (!result.includes(n)) result.push(n);
    });

    return result;
  }

  // ── TOAST NOTIFICATIONS HELPER ──
  function toast(msg) {
    const container = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `<span>✨</span><span>${escapeHtml(msg)}</span>`;
    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.remove();
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&link;')
      .replace(/"/g, '&quot;');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
