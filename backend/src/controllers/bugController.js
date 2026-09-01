const Bug = require('../models/Bug');

async function createBug(req, res) {
  const { title, module, severity, priority, description } = req.body;
  const reporter = req.authenticatedUser.username;

  const errors = [];
  if (!title || title.trim().length < 5)               errors.push('Title must be at least 5 characters.');
  if (!module || module.trim() === '')                  errors.push('Module is required.');
  if (!description || description.trim().length < 10)  errors.push('Description must be at least 10 characters.');
  if (!['Low', 'Medium', 'High', 'Critical'].includes(severity)) errors.push('Valid severity is required.');
  if (!['Low', 'Medium', 'High', 'Critical'].includes(priority)) errors.push('Valid priority is required.');
  if (errors.length) return res.status(400).json({ success: false, errors });

  const lastBug = await Bug.findOne().sort({ ticketId: -1 });
  const ticketId = lastBug ? lastBug.ticketId + 1 : 101;

  const newBug = await Bug.create({
    ticketId, title: title.trim(), module: module.trim(),
    severity, priority, description: description.trim(),
    status: 'Open', reporter, assignee: 'Unassigned',
  });

  res.status(201).json({ success: true, message: `BUG-${ticketId} created.`,
    bug: { ...newBug.toObject(), id: ticketId } });
}

async function getBugs(req, res) {
  const { status, priority, search } = req.query;
  let query = {};
  if (status && status !== 'All')     query.status   = new RegExp(`^${status}$`, 'i');
  if (priority && priority !== 'All') query.priority = new RegExp(`^${priority}$`, 'i');
  if (search) query.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];
  const bugs = await Bug.find(query).sort({ updatedAt: -1 });
  res.json({ success: true, count: bugs.length, bugs: bugs.map(b => ({ ...b.toObject(), id: b.ticketId })) });
}

async function claimBug(req, res) {
  const bugId    = parseInt(req.params.id, 10);
  const assignee = req.authenticatedUser.username;
  const updated  = await Bug.findOneAndUpdate(
    { ticketId: bugId },
    { assignee, status: 'In Progress' },
    { new: true }
  );
  if (!updated) return res.status(404).json({ success: false, errors: ['Ticket not found.'] });
  res.json({ success: true, message: `BUG-${bugId} claimed by ${assignee}.`,
    bug: { ...updated.toObject(), id: updated.ticketId } });
}

async function resolveBug(req, res) {
  const bugId = parseInt(req.params.id, 10);
  const { resolutionType, resolutionNotes } = req.body;
  const developer = req.authenticatedUser.username;

  if (!resolutionNotes || resolutionNotes.trim().length < 5)
    return res.status(400).json({ success: false, errors: ['Resolution notes must be at least 5 characters.'] });

  const updated = await Bug.findOneAndUpdate(
    { ticketId: bugId },
    { status: 'Resolved', resolutionType, resolutionNotes: resolutionNotes.trim(), assignee: developer },
    { new: true }
  );
  if (!updated) return res.status(404).json({ success: false, errors: ['Ticket not found.'] });
  res.json({ success: true, message: `BUG-${bugId} resolved by ${developer}.`,
    bug: { ...updated.toObject(), id: updated.ticketId } });
}

async function verifyBug(req, res) {
  const bugId = parseInt(req.params.id, 10);
  const { action, qaNotes } = req.body;

  if (action === 'reopen' && (!qaNotes || qaNotes.trim().length < 5))
    return res.status(400).json({ success: false, errors: ['Regression notes are required to re-open (min. 5 chars).'] });

  const newStatus = action === 'close' ? 'Closed' : 'Re-opened';
  const updated = await Bug.findOneAndUpdate(
    { ticketId: bugId },
    { status: newStatus, qaNotes: qaNotes ? qaNotes.trim() : null },
    { new: true }
  );
  if (!updated) return res.status(404).json({ success: false, errors: ['Ticket not found.'] });
  res.json({ success: true, message: `BUG-${bugId} → ${newStatus}.`,
    bug: { ...updated.toObject(), id: updated.ticketId } });
}

module.exports = { createBug, getBugs, claimBug, resolveBug, verifyBug };
