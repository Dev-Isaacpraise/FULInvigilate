import React, { useState, useEffect } from 'react';
import {
  Code2,
  Database,
  Cpu,
  Layers,
  Copy,
  Check,
  FileText,
  ShieldAlert,
  Server,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';

export const TechStackModal: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stack' | 'schema' | 'algorithm' | 'audit'>('stack');
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const sql = await api.getSqlSchema();
        setSqlSchema(sql);
      } catch (err) {
        console.error('Failed to load SQL schema:', err);
      }
    }
    async function fetchAudits() {
      try {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }
    }
    fetchSchema();
    fetchAudits();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('stack')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'stack'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tech Stack & Trade-offs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'schema'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Relational SQL DDL (schema.sql)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('algorithm')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'algorithm'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Allocation Engine Logic</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>System Audit Trail</span>
        </button>
      </div>

      {/* 1. Tech Stack & Trade-offs */}
      {activeSubTab === 'stack' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-emerald-950">
                University Final-Year Project Stack Recommendation
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Comparative analysis of web architectures specifically tailored for Federal University Lokoja final-year group defense and live demonstration.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Stack Option</th>
                    <th className="p-3 font-bold">Setup & Portability</th>
                    <th className="p-3 font-bold">Relational Integrity</th>
                    <th className="p-3 font-bold">Viva Demo Reliability</th>
                    <th className="p-3 font-bold">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="bg-emerald-50/40">
                    <td className="p-3 font-bold text-emerald-950">
                      Option A: Node.js (Express + TS) + React + Relational Schema
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-emerald-700">Exceptional (10/10)</span>
                      <p className="text-[11px] text-slate-500">
                        Zero external daemon setup. Runs on any evaluator laptop with standard Node.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">Standard SQL</span>
                      <p className="text-[11px] text-slate-500">
                        Full ANSI SQL DDL, foreign keys, migrations included for Chapter 3/4.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-emerald-700">100% Reliable</span>
                      <p className="text-[11px] text-slate-500">
                        No port conflicts, zero database socket errors during live defense.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-800 text-white">
                        SELECTED
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      Option B: Python (Django / FastAPI) + PostgreSQL + React
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-700">Moderate (7/10)</span>
                      <p className="text-[11px] text-slate-500">
                        Requires Python virtual environment, pip wheels, and local Postgres daemon.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">Native ORM</span>
                      <p className="text-[11px] text-slate-500">
                        Django ORM migrations are clean and well-documented.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-700">Good</span>
                      <p className="text-[11px] text-slate-500">
                        Vulnerable to Postgres connection refused on presentation laptops.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-500">Viable Alternative</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      Option C: Java (Spring Boot) + MySQL + Angular/Thymeleaf
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-rose-700">Heavy (5/10)</span>
                      <p className="text-[11px] text-slate-500">
                        Requires JDK 21, Maven, and MySQL server service running on 3306.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">JPA / Hibernate</span>
                      <p className="text-[11px] text-slate-500">
                        Strict relational enforcement and schema generation.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-600">Moderate</span>
                      <p className="text-[11px] text-slate-500">
                        Long cold boot times, heavy memory footprint during viva.
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-500">Too Heavy</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Defense Presentation Tips */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                Project Report (Chapter 3 & 4) Defense Talking Points
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>
                  <strong>Human-in-the-Loop Paradigm:</strong> The system is deliberately designed as a <em>Decision-Support System (DSS)</em> rather than a fully autonomous black box, maintaining administrative accountability.
                </li>
                <li>
                  <strong>Non-destructive Re-run:</strong> When exam timetables shift, re-running the allocation engine recalculates only open slots while strictly preserving human approvals and manual overrides.
                </li>
                <li>
                  <strong>Greedy Fairness Heuristic:</strong> Solves the NP-hard invigilation timetable scheduling problem with polynomial time complexity ($O(E \times V \times S)$) using ascending workload priority sorting.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. Relational SQL Schema */}
      {activeSubTab === 'schema' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>ANSI SQL Database Schema (db/schema.sql)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Standard DDL compatible with PostgreSQL, MySQL, and SQLite. Ready for project report documentation.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL DDL</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            <pre>{sqlSchema || '-- Loading database schema...'}</pre>
          </div>
        </div>
      )}

      {/* 3. Algorithm Specification */}
      {activeSubTab === 'algorithm' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-800">
          <div>
            <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>Allocation Algorithm Mathematical Formulation</span>
            </h2>
            <p className="text-xs text-slate-500">
              Formal business logic and constraint checking pipeline.
            </p>
          </div>

          <div className="space-y-3 leading-relaxed">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="font-bold text-slate-900 mb-1">1. Course Exclusion Rule (Hard Constraint)</h4>
              <p className="text-slate-600">
                Let $E$ be an examination for course $C$, where $C.lecturer\_id$ represents the assigned lecturer.
                A staff candidate $S$ is eligible if and only if:
              </p>
              <div className="bg-white p-2 rounded border border-slate-300 font-mono text-[11px] my-1 text-emerald-900">
                S.id !== C.lecturer_id
              </div>
              <p className="text-slate-500 text-[11px]">
                Note: This applies at the course level, permitting other colleagues in the same department to invigilate.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="font-bold text-slate-900 mb-1">2. No Double-Booking Overlap Check (Hard Constraint)</h4>
              <p className="text-slate-600">
                For an exam with date D1, start time Ts1, and end time Te1, candidate S cannot hold any active allocation on another exam where:
              </p>
              <div className="bg-white p-2 rounded border border-slate-300 font-mono text-[11px] my-1 text-emerald-900">
                (Date1 === Date2) &amp;&amp; (max(Start1, Start2) &lt; min(End1, End2))
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="font-bold text-slate-900 mb-1">3. Load Cap Ceiling (Hard Constraint)</h4>
              <p className="text-slate-600">
                Each faculty member has a predetermined ceiling (max_load). The allocation count must strictly satisfy:
              </p>
              <div className="bg-white p-2 rounded border border-slate-300 font-mono text-[11px] my-1 text-emerald-900">
                current_load &lt; staff.max_load
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="font-bold text-slate-900 mb-1">4. Fairness-Based Greedy Prioritization (Soft Heuristic)</h4>
              <p className="text-slate-600">
                From the set of eligible candidates, the engine sorts by ascending current load count:
              </p>
              <div className="bg-white p-2 rounded border border-slate-300 font-mono text-[11px] my-1 text-emerald-900">
                candidate = argmin(current_load[staff_id])
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Tie-breaker for Chief Invigilator: Seniority weight (Professor &gt; Assoc. Prof &gt; Senior Lecturer &gt; Lecturer I).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Audit Log */}
      {activeSubTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-emerald-950">
                System Activity Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Immutable audit records tracking every engine run, human override, and bulk approval.
              </p>
            </div>
            <span className="text-xs text-slate-400">{auditLogs.length} total events</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-300">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">{log.actor}</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px]">{log.details}</p>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
