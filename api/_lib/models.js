/* =============================================
   APACHETA — MONGOOSE SCHEMAS
   Telemetría cerebral, no CRUD genérico
   ============================================= */

import mongoose from 'mongoose';

// ─── USER ─────────────────────────────────────
const userSchema = new mongoose.Schema({
  userId:             { type: String, required: true, unique: true, index: true },
  nombre:             { type: String, default: '' },
  signo:              { type: String, default: '' },
  nacimiento:         { type: String, default: '' },
  colores:            { type: [String], default: ['#A8E6E0', '#F4C2C2', '#FFE44D'] },
  alucinajeActivo:    { type: Boolean, default: false },
  onboardingCompleto: { type: Boolean, default: false },
  cartaAstral:        { type: mongoose.Schema.Types.Mixed, default: null },
  numerologia:        { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

// ─── NOTA ─────────────────────────────────────
const notaSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  id:        { type: String, required: true },      // id del cliente, para sync
  titulo:    { type: String, default: '' },
  texto:     { type: String, default: '' },
  color:     { type: String, default: '#FFE44D' },
  tags:      { type: [String], default: [] },
  categoria: { type: String, default: '' },
  ts:        { type: Number, default: () => Date.now() },
}, { timestamps: true });

notaSchema.index({ userId: 1, id: 1 }, { unique: true });

// ─── MANIFIESTO ───────────────────────────────
const manifiestoSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  id:        { type: String, required: true },
  titulo:    { type: String, default: '' },
  texto:     { type: String, default: '' },
  tag:       { type: String, default: '' },
  tags:      { type: [String], default: [] },
  ts:        { type: Number, default: () => Date.now() },
}, { timestamps: true });

manifiestoSchema.index({ userId: 1, id: 1 }, { unique: true });

// ─── AURA HISTORY ─────────────────────────────
const auraSchema = new mongoose.Schema({
  userId:      { type: String, required: true, index: true },
  fecha:       { type: String, required: true },    // "YYYY-MM-DD"
  calma:       { type: Number, min: 0, max: 100, default: 50 },
  foco:        { type: Number, min: 0, max: 100, default: 50 },
  creatividad: { type: Number, min: 0, max: 100, default: 50 },
  energia:     { type: Number, min: 0, max: 100, default: 50 },
  intuicion:   { type: Number, min: 0, max: 100, default: 50 },
  colores:     { type: [String], default: [] },
  savedAt:     { type: Number, default: () => Date.now() },
}, { timestamps: true });

auraSchema.index({ userId: 1, fecha: 1 }, { unique: true });

// Evitar re-compilar modelos en hot reload serverless
export const User      = mongoose.models.User      || mongoose.model('User',      userSchema);
export const Nota      = mongoose.models.Nota      || mongoose.model('Nota',      notaSchema);
export const Manifiesto = mongoose.models.Manifiesto || mongoose.model('Manifiesto', manifiestoSchema);
export const AuraHistory = mongoose.models.AuraHistory || mongoose.model('AuraHistory', auraSchema);
