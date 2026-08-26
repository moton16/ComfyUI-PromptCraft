/**
* @vue/shared v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function _n(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const ie = {}, Ot = [], Je = () => {
}, $i = () => !1, ks = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Ms = (e) => e.startsWith("onUpdate:"), ue = Object.assign, vn = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, Ko = Object.prototype.hasOwnProperty, Z = (e, t) => Ko.call(e, t), U = Array.isArray, Pt = (e) => os(e) === "[object Map]", Ai = (e) => os(e) === "[object Set]", Hn = (e) => os(e) === "[object Date]", q = (e) => typeof e == "function", ce = (e) => typeof e == "string", Ie = (e) => typeof e == "symbol", te = (e) => e !== null && typeof e == "object", Oi = (e) => (te(e) || q(e)) && q(e.then) && q(e.catch), Pi = Object.prototype.toString, os = (e) => Pi.call(e), Wo = (e) => os(e).slice(8, -1), ki = (e) => os(e) === "[object Object]", bn = (e) => ce(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Wt = /* @__PURE__ */ _n(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Is = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((s) => t[s] || (t[s] = e(s)));
}, qo = /-\w/g, ke = Is(
  (e) => e.replace(qo, (t) => t.slice(1).toUpperCase())
), Go = /\B([A-Z])/g, xt = Is(
  (e) => e.replace(Go, "-$1").toLowerCase()
), Mi = Is((e) => e.charAt(0).toUpperCase() + e.slice(1)), Bs = Is(
  (e) => e ? `on${Mi(e)}` : ""
), Ge = (e, t) => !Object.is(e, t), ws = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Ii = (e, t, s, i = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: i,
    value: s
  });
}, yn = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
}, Jo = (e) => {
  const t = ce(e) ? Number(e) : NaN;
  return isNaN(t) ? e : t;
};
let jn;
const Rs = () => jn || (jn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ls(e) {
  if (U(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const i = e[s], n = ce(i) ? Zo(i) : Ls(i);
      if (n)
        for (const o in n)
          t[o] = n[o];
    }
    return t;
  } else if (ce(e) || te(e))
    return e;
}
const Yo = /;(?![^(]*\))/g, zo = /:([^]+)/, Xo = /\/\*[^]*?\*\//g;
function Zo(e) {
  const t = {};
  return e.replace(Xo, "").split(Yo).forEach((s) => {
    if (s) {
      const i = s.split(zo);
      i.length > 1 && (t[i[0].trim()] = i[1].trim());
    }
  }), t;
}
function Ce(e) {
  let t = "";
  if (ce(e))
    t = e;
  else if (U(e))
    for (let s = 0; s < e.length; s++) {
      const i = Ce(e[s]);
      i && (t += i + " ");
    }
  else if (te(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const Qo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", er = /* @__PURE__ */ _n(Qo);
function Ri(e) {
  return !!e || e === "";
}
function tr(e, t) {
  if (e.length !== t.length) return !1;
  let s = !0;
  for (let i = 0; s && i < e.length; i++)
    s = wn(e[i], t[i]);
  return s;
}
function wn(e, t) {
  if (e === t) return !0;
  let s = Hn(e), i = Hn(t);
  if (s || i)
    return s && i ? e.getTime() === t.getTime() : !1;
  if (s = Ie(e), i = Ie(t), s || i)
    return e === t;
  if (s = U(e), i = U(t), s || i)
    return s && i ? tr(e, t) : !1;
  if (s = te(e), i = te(t), s || i) {
    if (!s || !i)
      return !1;
    const n = Object.keys(e).length, o = Object.keys(t).length;
    if (n !== o)
      return !1;
    for (const r in e) {
      const l = e.hasOwnProperty(r), c = t.hasOwnProperty(r);
      if (l && !c || !l && c || !wn(e[r], t[r]))
        return !1;
    }
  }
  return String(e) === String(t);
}
const Li = (e) => !!(e && e.__v_isRef === !0), I = (e) => ce(e) ? e : e == null ? "" : U(e) || te(e) && (e.toString === Pi || !q(e.toString)) ? Li(e) ? I(e.value) : JSON.stringify(e, Fi, 2) : String(e), Fi = (e, t) => Li(t) ? Fi(e, t.value) : Pt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [i, n], o) => (s[Ks(i, o) + " =>"] = n, s),
    {}
  )
} : Ai(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => Ks(s))
} : Ie(t) ? Ks(t) : te(t) && !U(t) && !ki(t) ? String(t) : t, Ks = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Ie(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let pe;
class sr {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && pe && (pe.active ? (this.parent = pe, this.index = (pe.scopes || (pe.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].pause();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].resume();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = pe;
      try {
        return pe = this, t();
      } finally {
        pe = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = pe, pe = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (pe === this)
        pe = this.prevScope;
      else {
        let t = pe;
        for (; t; ) {
          if (t.prevScope === this) {
            t.prevScope = this.prevScope;
            break;
          }
          t = t.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, i;
      for (s = 0, i = this.effects.length; s < i; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, i = this.cleanups.length; s < i; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, i = this.scopes.length; s < i; s++)
          this.scopes[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const n = this.parent.scopes.pop();
        n && n !== this && (this.parent.scopes[this.index] = n, n.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function nr() {
  return pe;
}
let re;
const Ws = /* @__PURE__ */ new WeakSet();
class Ni {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, pe && (pe.active ? pe.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ws.has(this) && (Ws.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Vi(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Un(this), Hi(this);
    const t = re, s = Me;
    re = this, Me = !0;
    try {
      return this.fn();
    } finally {
      ji(this), re = t, Me = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        En(t);
      this.deps = this.depsTail = void 0, Un(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ws.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    sn(this) && this.run();
  }
  get dirty() {
    return sn(this);
  }
}
let Di = 0, qt, Gt;
function Vi(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Gt, Gt = e;
    return;
  }
  e.next = qt, qt = e;
}
function Cn() {
  Di++;
}
function xn() {
  if (--Di > 0)
    return;
  if (Gt) {
    let t = Gt;
    for (Gt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; qt; ) {
    let t = qt;
    for (qt = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (i) {
          e || (e = i);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function Hi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ji(e) {
  let t, s = e.depsTail, i = s;
  for (; i; ) {
    const n = i.prevDep;
    i.version === -1 ? (i === s && (s = n), En(i), ir(i)) : t = i, i.dep.activeLink = i.prevActiveLink, i.prevActiveLink = void 0, i = n;
  }
  e.deps = t, e.depsTail = s;
}
function sn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Ui(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Ui(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Qt) || (e.globalVersion = Qt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !sn(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = re, i = Me;
  re = e, Me = !0;
  try {
    Hi(e);
    const n = e.fn(e._value);
    (t.version === 0 || Ge(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
  } catch (n) {
    throw t.version++, n;
  } finally {
    re = s, Me = i, ji(e), e.flags &= -3;
  }
}
function En(e, t = !1) {
  const { dep: s, prevSub: i, nextSub: n } = e;
  if (i && (i.nextSub = n, e.prevSub = void 0), n && (n.prevSub = i, e.nextSub = void 0), s.subs === e && (s.subs = i, !i && s.computed)) {
    s.computed.flags &= -5;
    for (let o = s.computed.deps; o; o = o.nextDep)
      En(o, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function ir(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let Me = !0;
const Bi = [];
function nt() {
  Bi.push(Me), Me = !1;
}
function it() {
  const e = Bi.pop();
  Me = e === void 0 ? !0 : e;
}
function Un(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = re;
    re = void 0;
    try {
      t();
    } finally {
      re = s;
    }
  }
}
let Qt = 0;
class or {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Sn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!re || !Me || re === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== re)
      s = this.activeLink = new or(re, this), re.deps ? (s.prevDep = re.depsTail, re.depsTail.nextDep = s, re.depsTail = s) : re.deps = re.depsTail = s, Ki(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const i = s.nextDep;
      i.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = i), s.prevDep = re.depsTail, s.nextDep = void 0, re.depsTail.nextDep = s, re.depsTail = s, re.deps === s && (re.deps = i);
    }
    return s;
  }
  trigger(t) {
    this.version++, Qt++, this.notify(t);
  }
  notify(t) {
    Cn();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      xn();
    }
  }
}
function Ki(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let i = t.deps; i; i = i.nextDep)
        Ki(i);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const nn = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ Symbol(
  ""
), on = /* @__PURE__ */ Symbol(
  ""
), es = /* @__PURE__ */ Symbol(
  ""
);
function me(e, t, s) {
  if (Me && re) {
    let i = nn.get(e);
    i || nn.set(e, i = /* @__PURE__ */ new Map());
    let n = i.get(s);
    n || (i.set(s, n = new Sn()), n.map = i, n.key = s), n.track();
  }
}
function tt(e, t, s, i, n, o) {
  const r = nn.get(e);
  if (!r) {
    Qt++;
    return;
  }
  const l = (c) => {
    c && c.trigger();
  };
  if (Cn(), t === "clear")
    r.forEach(l);
  else {
    const c = U(e), a = c && bn(s);
    if (c && s === "length") {
      const f = Number(i);
      r.forEach((d, _) => {
        (_ === "length" || _ === es || !Ie(_) && _ >= f) && l(d);
      });
    } else
      switch ((s !== void 0 || r.has(void 0)) && l(r.get(s)), a && l(r.get(es)), t) {
        case "add":
          c ? a && l(r.get("length")) : (l(r.get(yt)), Pt(e) && l(r.get(on)));
          break;
        case "delete":
          c || (l(r.get(yt)), Pt(e) && l(r.get(on)));
          break;
        case "set":
          Pt(e) && l(r.get(yt));
          break;
      }
  }
  xn();
}
function Et(e) {
  const t = /* @__PURE__ */ z(e);
  return t === e ? t : (me(t, "iterate", es), /* @__PURE__ */ Oe(e) ? t : t.map(Re));
}
function Fs(e) {
  return me(e = /* @__PURE__ */ z(e), "iterate", es), e;
}
function We(e, t) {
  return /* @__PURE__ */ ot(e) ? Lt(/* @__PURE__ */ wt(e) ? Re(t) : t) : Re(t);
}
const rr = {
  __proto__: null,
  [Symbol.iterator]() {
    return qs(this, Symbol.iterator, (e) => We(this, e));
  },
  concat(...e) {
    return Et(this).concat(
      ...e.map((t) => U(t) ? Et(t) : t)
    );
  },
  entries() {
    return qs(this, "entries", (e) => (e[1] = We(this, e[1]), e));
  },
  every(e, t) {
    return Ze(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ze(
      this,
      "filter",
      e,
      t,
      (s) => s.map((i) => We(this, i)),
      arguments
    );
  },
  find(e, t) {
    return Ze(
      this,
      "find",
      e,
      t,
      (s) => We(this, s),
      arguments
    );
  },
  findIndex(e, t) {
    return Ze(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ze(
      this,
      "findLast",
      e,
      t,
      (s) => We(this, s),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Ze(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ze(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Gs(this, "includes", e);
  },
  indexOf(...e) {
    return Gs(this, "indexOf", e);
  },
  join(e) {
    return Et(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Gs(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ze(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Ht(this, "pop");
  },
  push(...e) {
    return Ht(this, "push", e);
  },
  reduce(e, ...t) {
    return Bn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Bn(this, "reduceRight", e, t);
  },
  shift() {
    return Ht(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ze(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Ht(this, "splice", e);
  },
  toReversed() {
    return Et(this).toReversed();
  },
  toSorted(e) {
    return Et(this).toSorted(e);
  },
  toSpliced(...e) {
    return Et(this).toSpliced(...e);
  },
  unshift(...e) {
    return Ht(this, "unshift", e);
  },
  values() {
    return qs(this, "values", (e) => We(this, e));
  }
};
function qs(e, t, s) {
  const i = Fs(e), n = i[t]();
  return i !== e && !/* @__PURE__ */ Oe(e) && (n._next = n.next, n.next = () => {
    const o = n._next();
    return o.done || (o.value = s(o.value)), o;
  }), n;
}
const lr = Array.prototype;
function Ze(e, t, s, i, n, o) {
  const r = Fs(e), l = r !== e && !/* @__PURE__ */ Oe(e), c = r[t];
  if (c !== lr[t]) {
    const d = c.apply(e, o);
    return l ? Re(d) : d;
  }
  let a = s;
  r !== e && (l ? a = function(d, _) {
    return s.call(this, We(e, d), _, e);
  } : s.length > 2 && (a = function(d, _) {
    return s.call(this, d, _, e);
  }));
  const f = c.call(r, a, i);
  return l && n ? n(f) : f;
}
function Bn(e, t, s, i) {
  const n = Fs(e), o = n !== e && !/* @__PURE__ */ Oe(e);
  let r = s, l = !1;
  n !== e && (o ? (l = i.length === 0, r = function(a, f, d) {
    return l && (l = !1, a = We(e, a)), s.call(this, a, We(e, f), d, e);
  }) : s.length > 3 && (r = function(a, f, d) {
    return s.call(this, a, f, d, e);
  }));
  const c = n[t](r, ...i);
  return l ? We(e, c) : c;
}
function Gs(e, t, s) {
  const i = /* @__PURE__ */ z(e);
  me(i, "iterate", es);
  const n = i[t](...s);
  return (n === -1 || n === !1) && /* @__PURE__ */ An(s[0]) ? (s[0] = /* @__PURE__ */ z(s[0]), i[t](...s)) : n;
}
function Ht(e, t, s = []) {
  nt(), Cn();
  const i = (/* @__PURE__ */ z(e))[t].apply(e, s);
  return xn(), it(), i;
}
const cr = /* @__PURE__ */ _n("__proto__,__v_isRef,__isVue"), Wi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Ie)
);
function ar(e) {
  Ie(e) || (e = String(e));
  const t = /* @__PURE__ */ z(this);
  return me(t, "has", e), t.hasOwnProperty(e);
}
class qi {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, i) {
    if (s === "__v_skip") return t.__v_skip;
    const n = this._isReadonly, o = this._isShallow;
    if (s === "__v_isReactive")
      return !n;
    if (s === "__v_isReadonly")
      return n;
    if (s === "__v_isShallow")
      return o;
    if (s === "__v_raw")
      return i === (n ? o ? br : zi : o ? Yi : Ji).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(i) ? t : void 0;
    const r = U(t);
    if (!n) {
      let c;
      if (r && (c = rr[s]))
        return c;
      if (s === "hasOwnProperty")
        return ar;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ ve(t) ? t : i
    );
    if ((Ie(s) ? Wi.has(s) : cr(s)) || (n || me(t, "get", s), o))
      return l;
    if (/* @__PURE__ */ ve(l)) {
      const c = r && bn(s) ? l : l.value;
      return n && te(c) ? /* @__PURE__ */ ln(c) : c;
    }
    return te(l) ? n ? /* @__PURE__ */ ln(l) : /* @__PURE__ */ Ye(l) : l;
  }
}
class Gi extends qi {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, i, n) {
    let o = t[s];
    const r = U(t) && bn(s);
    if (!this._isShallow) {
      const a = /* @__PURE__ */ ot(o);
      if (!/* @__PURE__ */ Oe(i) && !/* @__PURE__ */ ot(i) && (o = /* @__PURE__ */ z(o), i = /* @__PURE__ */ z(i)), !r && /* @__PURE__ */ ve(o) && !/* @__PURE__ */ ve(i))
        return a || (o.value = i), !0;
    }
    const l = r ? Number(s) < t.length : Z(t, s), c = Reflect.set(
      t,
      s,
      i,
      /* @__PURE__ */ ve(t) ? t : n
    );
    return t === /* @__PURE__ */ z(n) && (l ? Ge(i, o) && tt(t, "set", s, i) : tt(t, "add", s, i)), c;
  }
  deleteProperty(t, s) {
    const i = Z(t, s);
    t[s];
    const n = Reflect.deleteProperty(t, s);
    return n && i && tt(t, "delete", s, void 0), n;
  }
  has(t, s) {
    const i = Reflect.has(t, s);
    return (!Ie(s) || !Wi.has(s)) && me(t, "has", s), i;
  }
  ownKeys(t) {
    return me(
      t,
      "iterate",
      U(t) ? "length" : yt
    ), Reflect.ownKeys(t);
  }
}
class ur extends qi {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const fr = /* @__PURE__ */ new Gi(), dr = /* @__PURE__ */ new ur(), pr = /* @__PURE__ */ new Gi(!0);
const rn = (e) => e, gs = (e) => Reflect.getPrototypeOf(e);
function hr(e, t, s) {
  return function(...i) {
    const n = this.__v_raw, o = /* @__PURE__ */ z(n), r = Pt(o), l = e === "entries" || e === Symbol.iterator && r, c = e === "keys" && r, a = n[e](...i), f = s ? rn : t ? Lt : Re;
    return !t && me(
      o,
      "iterate",
      c ? on : yt
    ), ue(
      // inheriting all iterator properties
      Object.create(a),
      {
        // iterator protocol
        next() {
          const { value: d, done: _ } = a.next();
          return _ ? { value: d, done: _ } : {
            value: l ? [f(d[0]), f(d[1])] : f(d),
            done: _
          };
        }
      }
    );
  };
}
function ms(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function gr(e, t) {
  const s = {
    get(n) {
      const o = this.__v_raw, r = /* @__PURE__ */ z(o), l = /* @__PURE__ */ z(n);
      e || (Ge(n, l) && me(r, "get", n), me(r, "get", l));
      const { has: c } = gs(r), a = t ? rn : e ? Lt : Re;
      if (c.call(r, n))
        return a(o.get(n));
      if (c.call(r, l))
        return a(o.get(l));
      o !== r && o.get(n);
    },
    get size() {
      const n = this.__v_raw;
      return !e && me(/* @__PURE__ */ z(n), "iterate", yt), n.size;
    },
    has(n) {
      const o = this.__v_raw, r = /* @__PURE__ */ z(o), l = /* @__PURE__ */ z(n);
      return e || (Ge(n, l) && me(r, "has", n), me(r, "has", l)), n === l ? o.has(n) : o.has(n) || o.has(l);
    },
    forEach(n, o) {
      const r = this, l = r.__v_raw, c = /* @__PURE__ */ z(l), a = t ? rn : e ? Lt : Re;
      return !e && me(c, "iterate", yt), l.forEach((f, d) => n.call(o, a(f), a(d), r));
    }
  };
  return ue(
    s,
    e ? {
      add: ms("add"),
      set: ms("set"),
      delete: ms("delete"),
      clear: ms("clear")
    } : {
      add(n) {
        const o = /* @__PURE__ */ z(this), r = gs(o), l = /* @__PURE__ */ z(n), c = !t && !/* @__PURE__ */ Oe(n) && !/* @__PURE__ */ ot(n) ? l : n;
        return r.has.call(o, c) || Ge(n, c) && r.has.call(o, n) || Ge(l, c) && r.has.call(o, l) || (o.add(c), tt(o, "add", c, c)), this;
      },
      set(n, o) {
        !t && !/* @__PURE__ */ Oe(o) && !/* @__PURE__ */ ot(o) && (o = /* @__PURE__ */ z(o));
        const r = /* @__PURE__ */ z(this), { has: l, get: c } = gs(r);
        let a = l.call(r, n);
        a || (n = /* @__PURE__ */ z(n), a = l.call(r, n));
        const f = c.call(r, n);
        return r.set(n, o), a ? Ge(o, f) && tt(r, "set", n, o) : tt(r, "add", n, o), this;
      },
      delete(n) {
        const o = /* @__PURE__ */ z(this), { has: r, get: l } = gs(o);
        let c = r.call(o, n);
        c || (n = /* @__PURE__ */ z(n), c = r.call(o, n)), l && l.call(o, n);
        const a = o.delete(n);
        return c && tt(o, "delete", n, void 0), a;
      },
      clear() {
        const n = /* @__PURE__ */ z(this), o = n.size !== 0, r = n.clear();
        return o && tt(
          n,
          "clear",
          void 0,
          void 0
        ), r;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((n) => {
    s[n] = hr(n, e, t);
  }), s;
}
function Tn(e, t) {
  const s = gr(e, t);
  return (i, n, o) => n === "__v_isReactive" ? !e : n === "__v_isReadonly" ? e : n === "__v_raw" ? i : Reflect.get(
    Z(s, n) && n in i ? s : i,
    n,
    o
  );
}
const mr = {
  get: /* @__PURE__ */ Tn(!1, !1)
}, _r = {
  get: /* @__PURE__ */ Tn(!1, !0)
}, vr = {
  get: /* @__PURE__ */ Tn(!0, !1)
};
const Ji = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap();
function yr(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return /* @__PURE__ */ ot(e) ? e : $n(
    e,
    !1,
    fr,
    mr,
    Ji
  );
}
// @__NO_SIDE_EFFECTS__
function wr(e) {
  return $n(
    e,
    !1,
    pr,
    _r,
    Yi
  );
}
// @__NO_SIDE_EFFECTS__
function ln(e) {
  return $n(
    e,
    !0,
    dr,
    vr,
    zi
  );
}
function $n(e, t, s, i, n) {
  if (!te(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const o = n.get(e);
  if (o)
    return o;
  const r = yr(Wo(e));
  if (r === 0)
    return e;
  const l = new Proxy(
    e,
    r === 2 ? i : s
  );
  return n.set(e, l), l;
}
// @__NO_SIDE_EFFECTS__
function wt(e) {
  return /* @__PURE__ */ ot(e) ? /* @__PURE__ */ wt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function An(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function z(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ z(t) : e;
}
function Cr(e) {
  return !Z(e, "__v_skip") && Object.isExtensible(e) && Ii(e, "__v_skip", !0), e;
}
const Re = (e) => te(e) ? /* @__PURE__ */ Ye(e) : e, Lt = (e) => te(e) ? /* @__PURE__ */ ln(e) : e;
// @__NO_SIDE_EFFECTS__
function ve(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Ee(e) {
  return xr(e, !1);
}
function xr(e, t) {
  return /* @__PURE__ */ ve(e) ? e : new Er(e, t);
}
class Er {
  constructor(t, s) {
    this.dep = new Sn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : /* @__PURE__ */ z(t), this._value = s ? t : Re(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, i = this.__v_isShallow || /* @__PURE__ */ Oe(t) || /* @__PURE__ */ ot(t);
    t = i ? t : /* @__PURE__ */ z(t), Ge(t, s) && (this._rawValue = t, this._value = i ? t : Re(t), this.dep.trigger());
  }
}
function L(e) {
  return /* @__PURE__ */ ve(e) ? e.value : e;
}
const Sr = {
  get: (e, t, s) => t === "__v_raw" ? e : L(Reflect.get(e, t, s)),
  set: (e, t, s, i) => {
    const n = e[t];
    return /* @__PURE__ */ ve(n) && !/* @__PURE__ */ ve(s) ? (n.value = s, !0) : Reflect.set(e, t, s, i);
  }
};
function Xi(e) {
  return /* @__PURE__ */ wt(e) ? e : new Proxy(e, Sr);
}
class Tr {
  constructor(t, s, i) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Sn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Qt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = i;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    re !== this)
      return Vi(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Ui(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function $r(e, t, s = !1) {
  let i, n;
  return q(e) ? i = e : (i = e.get, n = e.set), new Tr(i, n, s);
}
const _s = {}, Es = /* @__PURE__ */ new WeakMap();
let bt;
function Ar(e, t = !1, s = bt) {
  if (s) {
    let i = Es.get(s);
    i || Es.set(s, i = []), i.push(e);
  }
}
function Or(e, t, s = ie) {
  const { immediate: i, deep: n, once: o, scheduler: r, augmentJob: l, call: c } = s, a = (b) => n ? b : /* @__PURE__ */ Oe(b) || n === !1 || n === 0 ? st(b, 1) : st(b);
  let f, d, _, E, j = !1, F = !1;
  if (/* @__PURE__ */ ve(e) ? (d = () => e.value, j = /* @__PURE__ */ Oe(e)) : /* @__PURE__ */ wt(e) ? (d = () => a(e), j = !0) : U(e) ? (F = !0, j = e.some((b) => /* @__PURE__ */ wt(b) || /* @__PURE__ */ Oe(b)), d = () => e.map((b) => {
    if (/* @__PURE__ */ ve(b))
      return b.value;
    if (/* @__PURE__ */ wt(b))
      return a(b);
    if (q(b))
      return c ? c(b, 2) : b();
  })) : q(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (_) {
      nt();
      try {
        _();
      } finally {
        it();
      }
    }
    const b = bt;
    bt = f;
    try {
      return c ? c(e, 3, [E]) : e(E);
    } finally {
      bt = b;
    }
  } : d = Je, t && n) {
    const b = d, k = n === !0 ? 1 / 0 : n;
    d = () => st(b(), k);
  }
  const Y = nr(), R = () => {
    f.stop(), Y && Y.active && vn(Y.effects, f);
  };
  if (o && t) {
    const b = t;
    t = (...k) => {
      b(...k), R();
    };
  }
  let P = F ? new Array(e.length).fill(_s) : _s;
  const T = (b) => {
    if (!(!(f.flags & 1) || !f.dirty && !b))
      if (t) {
        const k = f.run();
        if (n || j || (F ? k.some((S, v) => Ge(S, P[v])) : Ge(k, P))) {
          _ && _();
          const S = bt;
          bt = f;
          try {
            const v = [
              k,
              // pass undefined as the old value when it's changed for the first time
              P === _s ? void 0 : F && P[0] === _s ? [] : P,
              E
            ];
            P = k, c ? c(t, 3, v) : (
              // @ts-expect-error
              t(...v)
            );
          } finally {
            bt = S;
          }
        }
      } else
        f.run();
  };
  return l && l(T), f = new Ni(d), f.scheduler = r ? () => r(T, !1) : T, E = (b) => Ar(b, !1, f), _ = f.onStop = () => {
    const b = Es.get(f);
    if (b) {
      if (c)
        c(b, 4);
      else
        for (const k of b) k();
      Es.delete(f);
    }
  }, t ? i ? T(!0) : P = f.run() : r ? r(T.bind(null, !0), !0) : f.run(), R.pause = f.pause.bind(f), R.resume = f.resume.bind(f), R.stop = R, R;
}
function st(e, t = 1 / 0, s) {
  if (t <= 0 || !te(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, /* @__PURE__ */ ve(e))
    st(e.value, t, s);
  else if (U(e))
    for (let i = 0; i < e.length; i++)
      st(e[i], t, s);
  else if (Ai(e) || Pt(e))
    e.forEach((i) => {
      st(i, t, s);
    });
  else if (ki(e)) {
    for (const i in e)
      st(e[i], t, s);
    for (const i of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, i) && st(e[i], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function rs(e, t, s, i) {
  try {
    return i ? e(...i) : e();
  } catch (n) {
    Ns(n, t, s);
  }
}
function Pe(e, t, s, i) {
  if (q(e)) {
    const n = rs(e, t, s, i);
    return n && Oi(n) && n.catch((o) => {
      Ns(o, t, s);
    }), n;
  }
  if (U(e)) {
    const n = [];
    for (let o = 0; o < e.length; o++)
      n.push(Pe(e[o], t, s, i));
    return n;
  }
}
function Ns(e, t, s, i = !0) {
  const n = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: r } = t && t.appContext.config || ie;
  if (t) {
    let l = t.parent;
    const c = t.proxy, a = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const f = l.ec;
      if (f) {
        for (let d = 0; d < f.length; d++)
          if (f[d](e, c, a) === !1)
            return;
      }
      l = l.parent;
    }
    if (o) {
      nt(), rs(o, null, 10, [
        e,
        c,
        a
      ]), it();
      return;
    }
  }
  Pr(e, s, n, i, r);
}
function Pr(e, t, s, i = !0, n = !1) {
  if (n)
    throw e;
  console.error(e);
}
const ye = [];
let je = -1;
const kt = [];
let ut = null, St = 0;
const Zi = /* @__PURE__ */ Promise.resolve();
let Ss = null;
function kr(e) {
  const t = Ss || Zi;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Mr(e) {
  let t = je + 1, s = ye.length;
  for (; t < s; ) {
    const i = t + s >>> 1, n = ye[i], o = ts(n);
    o < e || o === e && n.flags & 2 ? t = i + 1 : s = i;
  }
  return t;
}
function On(e) {
  if (!(e.flags & 1)) {
    const t = ts(e), s = ye[ye.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= ts(s) ? ye.push(e) : ye.splice(Mr(t), 0, e), e.flags |= 1, Qi();
  }
}
function Qi() {
  Ss || (Ss = Zi.then(to));
}
function Ir(e) {
  U(e) ? kt.push(...e) : ut && e.id === -1 ? ut.splice(St + 1, 0, e) : e.flags & 1 || (kt.push(e), e.flags |= 1), Qi();
}
function Kn(e, t, s = je + 1) {
  for (; s < ye.length; s++) {
    const i = ye[s];
    if (i && i.flags & 2) {
      if (e && i.id !== e.uid)
        continue;
      ye.splice(s, 1), s--, i.flags & 4 && (i.flags &= -2), i(), i.flags & 4 || (i.flags &= -2);
    }
  }
}
function eo(e) {
  if (kt.length) {
    const t = [...new Set(kt)].sort(
      (s, i) => ts(s) - ts(i)
    );
    if (kt.length = 0, ut) {
      ut.push(...t);
      return;
    }
    for (ut = t, St = 0; St < ut.length; St++) {
      const s = ut[St];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    ut = null, St = 0;
  }
}
const ts = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function to(e) {
  try {
    for (je = 0; je < ye.length; je++) {
      const t = ye[je];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), rs(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; je < ye.length; je++) {
      const t = ye[je];
      t && (t.flags &= -2);
    }
    je = -1, ye.length = 0, eo(), Ss = null, (ye.length || kt.length) && to();
  }
}
let _e = null, so = null;
function Ts(e) {
  const t = _e;
  return _e = e, so = e && e.type.__scopeId || null, t;
}
function rt(e, t = _e, s) {
  if (!t || e._n)
    return e;
  const i = (...n) => {
    i._d && si(-1);
    const o = Ts(t);
    let r;
    try {
      r = e(...n);
    } finally {
      Ts(o), i._d && si(1);
    }
    return r;
  };
  return i._n = !0, i._c = !0, i._d = !0, i;
}
function Ue(e, t) {
  if (_e === null)
    return e;
  const s = js(_e), i = e.dirs || (e.dirs = []);
  for (let n = 0; n < t.length; n++) {
    let [o, r, l, c = ie] = t[n];
    o && (q(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && st(r), i.push({
      dir: o,
      instance: s,
      value: r,
      oldValue: void 0,
      arg: l,
      modifiers: c
    }));
  }
  return e;
}
function mt(e, t, s, i) {
  const n = e.dirs, o = t && t.dirs;
  for (let r = 0; r < n.length; r++) {
    const l = n[r];
    o && (l.oldValue = o[r].value);
    let c = l.dir[i];
    c && (nt(), Pe(c, s, 8, [
      e.el,
      l,
      e,
      t
    ]), it());
  }
}
function Rr(e, t) {
  if (we) {
    let s = we.provides;
    const i = we.parent && we.parent.provides;
    i === s && (s = we.provides = Object.create(i)), s[e] = t;
  }
}
function Cs(e, t, s = !1) {
  const i = Mo();
  if (i || It) {
    let n = It ? It._context.provides : i ? i.parent == null || i.ce ? i.vnode.appContext && i.vnode.appContext.provides : i.parent.provides : void 0;
    if (n && e in n)
      return n[e];
    if (arguments.length > 1)
      return s && q(t) ? t.call(i && i.proxy) : t;
  }
}
const Lr = /* @__PURE__ */ Symbol.for("v-scx"), Fr = () => Cs(Lr);
function Js(e, t, s) {
  return no(e, t, s);
}
function no(e, t, s = ie) {
  const { immediate: i, deep: n, flush: o, once: r } = s, l = ue({}, s), c = t && i || !t && o !== "post";
  let a;
  if (is) {
    if (o === "sync") {
      const E = Fr();
      a = E.__watcherHandles || (E.__watcherHandles = []);
    } else if (!c) {
      const E = () => {
      };
      return E.stop = Je, E.resume = Je, E.pause = Je, E;
    }
  }
  const f = we;
  l.call = (E, j, F) => Pe(E, f, j, F);
  let d = !1;
  o === "post" ? l.scheduler = (E) => {
    xe(E, f && f.suspense);
  } : o !== "sync" && (d = !0, l.scheduler = (E, j) => {
    j ? E() : On(E);
  }), l.augmentJob = (E) => {
    t && (E.flags |= 4), d && (E.flags |= 2, f && (E.id = f.uid, E.i = f));
  };
  const _ = Or(e, t, l);
  return is && (a ? a.push(_) : c && _()), _;
}
function Nr(e, t, s) {
  const i = this.proxy, n = ce(e) ? e.includes(".") ? io(i, e) : () => i[e] : e.bind(i, i);
  let o;
  q(t) ? o = t : (o = t.handler, s = t);
  const r = cs(this), l = no(n, o.bind(i), s);
  return r(), l;
}
function io(e, t) {
  const s = t.split(".");
  return () => {
    let i = e;
    for (let n = 0; n < s.length && i; n++)
      i = i[s[n]];
    return i;
  };
}
const Dr = /* @__PURE__ */ Symbol("_vte"), Vr = (e) => e.__isTeleport, Be = /* @__PURE__ */ Symbol("_leaveCb"), jt = /* @__PURE__ */ Symbol("_enterCb");
function Hr() {
  const e = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  return dt(() => {
    e.isMounted = !0;
  }), uo(() => {
    e.isUnmounting = !0;
  }), e;
}
const Ae = [Function, Array], jr = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: Ae,
  onEnter: Ae,
  onAfterEnter: Ae,
  onEnterCancelled: Ae,
  // leave
  onBeforeLeave: Ae,
  onLeave: Ae,
  onAfterLeave: Ae,
  onLeaveCancelled: Ae,
  // appear
  onBeforeAppear: Ae,
  onAppear: Ae,
  onAfterAppear: Ae,
  onAppearCancelled: Ae
};
function Ur(e, t) {
  const { leavingVNodes: s } = e;
  let i = s.get(t.type);
  return i || (i = /* @__PURE__ */ Object.create(null), s.set(t.type, i)), i;
}
function cn(e, t, s, i, n) {
  const {
    appear: o,
    mode: r,
    persisted: l = !1,
    onBeforeEnter: c,
    onEnter: a,
    onAfterEnter: f,
    onEnterCancelled: d,
    onBeforeLeave: _,
    onLeave: E,
    onAfterLeave: j,
    onLeaveCancelled: F,
    onBeforeAppear: Y,
    onAppear: R,
    onAfterAppear: P,
    onAppearCancelled: T
  } = t, b = String(e.key), k = Ur(s, e), S = (N, G) => {
    N && Pe(
      N,
      i,
      9,
      G
    );
  }, v = (N, G) => {
    const Q = G[1];
    S(N, G), U(N) ? N.every((m) => m.length <= 1) && Q() : N.length <= 1 && Q();
  }, B = {
    mode: r,
    persisted: l,
    beforeEnter(N) {
      let G = c;
      if (!s.isMounted)
        if (o)
          G = Y || c;
        else
          return;
      N[Be] && N[Be](
        !0
        /* cancelled */
      );
      const Q = k[b];
      Q && Tt(e, Q) && Q.el[Be] && Q.el[Be](), S(G, [N]);
    },
    enter(N) {
      if (k[b] === e) return;
      let G = a, Q = f, m = d;
      if (!s.isMounted)
        if (o)
          G = R || a, Q = P || f, m = T || d;
        else
          return;
      let ee = !1;
      N[jt] = (Xe) => {
        ee || (ee = !0, Xe ? S(m, [N]) : S(Q, [N]), B.delayedLeave && B.delayedLeave(), N[jt] = void 0);
      };
      const ge = N[jt].bind(null, !1);
      G ? v(G, [N, ge]) : ge();
    },
    leave(N, G) {
      const Q = String(e.key);
      if (N[jt] && N[jt](
        !0
        /* cancelled */
      ), s.isUnmounting)
        return G();
      S(_, [N]);
      let m = !1;
      N[Be] = (ge) => {
        m || (m = !0, G(), ge ? S(F, [N]) : S(j, [N]), N[Be] = void 0, k[Q] === e && delete k[Q]);
      };
      const ee = N[Be].bind(null, !1);
      k[Q] = e, E ? v(E, [N, ee]) : ee();
    },
    clone(N) {
      return cn(
        N,
        t,
        s,
        i
      );
    }
  };
  return B;
}
function ss(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, ss(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function oo(e, t = !1, s) {
  let i = [], n = 0;
  for (let o = 0; o < e.length; o++) {
    let r = e[o];
    const l = s == null ? r.key : String(s) + String(r.key != null ? r.key : o);
    r.type === X ? (r.patchFlag & 128 && n++, i = i.concat(
      oo(r.children, t, l)
    )) : (t || r.type !== ze) && i.push(l != null ? Ct(r, { key: l }) : r);
  }
  if (n > 1)
    for (let o = 0; o < i.length; o++)
      i[o].patchFlag = -2;
  return i;
}
function ro(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Wn(e, t) {
  let s;
  return !!((s = Object.getOwnPropertyDescriptor(e, t)) && !s.configurable);
}
const $s = /* @__PURE__ */ new WeakMap();
function Jt(e, t, s, i, n = !1) {
  if (U(e)) {
    e.forEach(
      (F, Y) => Jt(
        F,
        t && (U(t) ? t[Y] : t),
        s,
        i,
        n
      )
    );
    return;
  }
  if (Mt(i) && !n) {
    i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && Jt(e, t, s, i.component.subTree);
    return;
  }
  const o = i.shapeFlag & 4 ? js(i.component) : i.el, r = n ? null : o, { i: l, r: c } = e, a = t && t.r, f = l.refs === ie ? l.refs = {} : l.refs, d = l.setupState, _ = /* @__PURE__ */ z(d), E = d === ie ? $i : (F) => Wn(f, F) ? !1 : Z(_, F), j = (F, Y) => !(Y && Wn(f, Y));
  if (a != null && a !== c) {
    if (qn(t), ce(a))
      f[a] = null, E(a) && (d[a] = null);
    else if (/* @__PURE__ */ ve(a)) {
      const F = t;
      j(a, F.k) && (a.value = null), F.k && (f[F.k] = null);
    }
  }
  if (q(c))
    rs(c, l, 12, [r, f]);
  else {
    const F = ce(c), Y = /* @__PURE__ */ ve(c);
    if (F || Y) {
      const R = () => {
        if (e.f) {
          const P = F ? E(c) ? d[c] : f[c] : j() || !e.k ? c.value : f[e.k];
          if (n)
            U(P) && vn(P, o);
          else if (U(P))
            P.includes(o) || P.push(o);
          else if (F)
            f[c] = [o], E(c) && (d[c] = f[c]);
          else {
            const T = [o];
            j(c, e.k) && (c.value = T), e.k && (f[e.k] = T);
          }
        } else F ? (f[c] = r, E(c) && (d[c] = r)) : Y && (j(c, e.k) && (c.value = r), e.k && (f[e.k] = r));
      };
      if (r) {
        const P = () => {
          R(), $s.delete(e);
        };
        P.id = -1, $s.set(e, P), xe(P, s);
      } else
        qn(e), R();
    }
  }
}
function qn(e) {
  const t = $s.get(e);
  t && (t.flags |= 8, $s.delete(e));
}
Rs().requestIdleCallback;
Rs().cancelIdleCallback;
const Mt = (e) => !!e.type.__asyncLoader, lo = (e) => e.type.__isKeepAlive;
function Br(e, t) {
  co(e, "a", t);
}
function Kr(e, t) {
  co(e, "da", t);
}
function co(e, t, s = we) {
  const i = e.__wdc || (e.__wdc = () => {
    let n = s;
    for (; n; ) {
      if (n.isDeactivated)
        return;
      n = n.parent;
    }
    return e();
  });
  if (Ds(t, i, s), s) {
    let n = s.parent;
    for (; n && n.parent; )
      lo(n.parent.vnode) && Wr(i, t, s, n), n = n.parent;
  }
}
function Wr(e, t, s, i) {
  const n = Ds(
    t,
    e,
    i,
    !0
    /* prepend */
  );
  ls(() => {
    vn(i[t], n);
  }, s);
}
function Ds(e, t, s = we, i = !1) {
  if (s) {
    const n = s[e] || (s[e] = []), o = t.__weh || (t.__weh = (...r) => {
      nt();
      const l = cs(s), c = Pe(t, s, e, r);
      return l(), it(), c;
    });
    return i ? n.unshift(o) : n.push(o), o;
  }
}
const lt = (e) => (t, s = we) => {
  (!is || e === "sp") && Ds(e, (...i) => t(...i), s);
}, qr = lt("bm"), dt = lt("m"), Gr = lt(
  "bu"
), ao = lt("u"), uo = lt(
  "bum"
), ls = lt("um"), Jr = lt(
  "sp"
), Yr = lt("rtg"), zr = lt("rtc");
function Xr(e, t = we) {
  Ds("ec", e, t);
}
const Zr = /* @__PURE__ */ Symbol.for("v-ndc");
function Te(e, t, s, i) {
  let n;
  const o = s, r = U(e);
  if (r || ce(e)) {
    const l = r && /* @__PURE__ */ wt(e);
    let c = !1, a = !1;
    l && (c = !/* @__PURE__ */ Oe(e), a = /* @__PURE__ */ ot(e), e = Fs(e)), n = new Array(e.length);
    for (let f = 0, d = e.length; f < d; f++)
      n[f] = t(
        c ? a ? Lt(Re(e[f])) : Re(e[f]) : e[f],
        f,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    n = new Array(e);
    for (let l = 0; l < e; l++)
      n[l] = t(l + 1, l, void 0, o);
  } else if (te(e))
    if (e[Symbol.iterator])
      n = Array.from(
        e,
        (l, c) => t(l, c, void 0, o)
      );
    else {
      const l = Object.keys(e);
      n = new Array(l.length);
      for (let c = 0, a = l.length; c < a; c++) {
        const f = l[c];
        n[c] = t(e[f], f, c, o);
      }
    }
  else
    n = [];
  return n;
}
function Gn(e, t, s = {}, i, n) {
  if (_e.ce || _e.parent && Mt(_e.parent) && _e.parent.ce) {
    const a = Object.keys(s).length > 0;
    return t !== "default" && (s.name = t), D(), ft(
      X,
      null,
      [he("slot", s, i)],
      a ? -2 : 64
    );
  }
  let o = e[t];
  o && o._c && (o._d = !1), D();
  const r = o && fo(o(s)), l = s.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  r && r.key, c = ft(
    X,
    {
      key: (l && !Ie(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!r && i ? "_fb" : "")
    },
    r || [],
    r && e._ === 1 ? 64 : -2
  );
  return o && o._c && (o._d = !0), c;
}
function fo(e) {
  return e.some((t) => Mn(t) ? !(t.type === ze || t.type === X && !fo(t.children)) : !0) ? e : null;
}
const an = (e) => e ? Io(e) ? js(e) : an(e.parent) : null, Yt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ue(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => an(e.parent),
    $root: (e) => an(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => ho(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      On(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = kr.bind(e.proxy)),
    $watch: (e) => Nr.bind(e)
  })
), Ys = (e, t) => e !== ie && !e.__isScriptSetup && Z(e, t), Qr = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: i, data: n, props: o, accessCache: r, type: l, appContext: c } = e;
    if (t[0] !== "$") {
      const _ = r[t];
      if (_ !== void 0)
        switch (_) {
          case 1:
            return i[t];
          case 2:
            return n[t];
          case 4:
            return s[t];
          case 3:
            return o[t];
        }
      else {
        if (Ys(i, t))
          return r[t] = 1, i[t];
        if (n !== ie && Z(n, t))
          return r[t] = 2, n[t];
        if (Z(o, t))
          return r[t] = 3, o[t];
        if (s !== ie && Z(s, t))
          return r[t] = 4, s[t];
        un && (r[t] = 0);
      }
    }
    const a = Yt[t];
    let f, d;
    if (a)
      return t === "$attrs" && me(e.attrs, "get", ""), a(e);
    if (
      // css module (injected by vue-loader)
      (f = l.__cssModules) && (f = f[t])
    )
      return f;
    if (s !== ie && Z(s, t))
      return r[t] = 4, s[t];
    if (
      // global properties
      d = c.config.globalProperties, Z(d, t)
    )
      return d[t];
  },
  set({ _: e }, t, s) {
    const { data: i, setupState: n, ctx: o } = e;
    return Ys(n, t) ? (n[t] = s, !0) : i !== ie && Z(i, t) ? (i[t] = s, !0) : Z(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: i, appContext: n, props: o, type: r }
  }, l) {
    let c;
    return !!(s[l] || e !== ie && l[0] !== "$" && Z(e, l) || Ys(t, l) || Z(o, l) || Z(i, l) || Z(Yt, l) || Z(n.config.globalProperties, l) || (c = r.__cssModules) && c[l]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : Z(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function Jn(e) {
  return U(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let un = !0;
function el(e) {
  const t = ho(e), s = e.proxy, i = e.ctx;
  un = !1, t.beforeCreate && Yn(t.beforeCreate, e, "bc");
  const {
    // state
    data: n,
    computed: o,
    methods: r,
    watch: l,
    provide: c,
    inject: a,
    // lifecycle
    created: f,
    beforeMount: d,
    mounted: _,
    beforeUpdate: E,
    updated: j,
    activated: F,
    deactivated: Y,
    beforeDestroy: R,
    beforeUnmount: P,
    destroyed: T,
    unmounted: b,
    render: k,
    renderTracked: S,
    renderTriggered: v,
    errorCaptured: B,
    serverPrefetch: N,
    // public API
    expose: G,
    inheritAttrs: Q,
    // assets
    components: m,
    directives: ee,
    filters: ge
  } = t;
  if (a && tl(a, i, null), r)
    for (const le in r) {
      const oe = r[le];
      q(oe) && (i[le] = oe.bind(s));
    }
  if (n) {
    const le = n.call(s, s);
    te(le) && (e.data = /* @__PURE__ */ Ye(le));
  }
  if (un = !0, o)
    for (const le in o) {
      const oe = o[le], ht = q(oe) ? oe.bind(s, s) : q(oe.get) ? oe.get.bind(s, s) : Je, ps = !q(oe) && q(oe.set) ? oe.set.bind(s) : Je, gt = Nl({
        get: ht,
        set: ps
      });
      Object.defineProperty(i, le, {
        enumerable: !0,
        configurable: !0,
        get: () => gt.value,
        set: (Le) => gt.value = Le
      });
    }
  if (l)
    for (const le in l)
      po(l[le], i, s, le);
  if (c) {
    const le = q(c) ? c.call(s) : c;
    Reflect.ownKeys(le).forEach((oe) => {
      Rr(oe, le[oe]);
    });
  }
  f && Yn(f, e, "c");
  function fe(le, oe) {
    U(oe) ? oe.forEach((ht) => le(ht.bind(s))) : oe && le(oe.bind(s));
  }
  if (fe(qr, d), fe(dt, _), fe(Gr, E), fe(ao, j), fe(Br, F), fe(Kr, Y), fe(Xr, B), fe(zr, S), fe(Yr, v), fe(uo, P), fe(ls, b), fe(Jr, N), U(G))
    if (G.length) {
      const le = e.exposed || (e.exposed = {});
      G.forEach((oe) => {
        Object.defineProperty(le, oe, {
          get: () => s[oe],
          set: (ht) => s[oe] = ht,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  k && e.render === Je && (e.render = k), Q != null && (e.inheritAttrs = Q), m && (e.components = m), ee && (e.directives = ee), N && ro(e);
}
function tl(e, t, s = Je) {
  U(e) && (e = fn(e));
  for (const i in e) {
    const n = e[i];
    let o;
    te(n) ? "default" in n ? o = Cs(
      n.from || i,
      n.default,
      !0
    ) : o = Cs(n.from || i) : o = Cs(n), /* @__PURE__ */ ve(o) ? Object.defineProperty(t, i, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (r) => o.value = r
    }) : t[i] = o;
  }
}
function Yn(e, t, s) {
  Pe(
    U(e) ? e.map((i) => i.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function po(e, t, s, i) {
  let n = i.includes(".") ? io(s, i) : () => s[i];
  if (ce(e)) {
    const o = t[e];
    q(o) && Js(n, o);
  } else if (q(e))
    Js(n, e.bind(s));
  else if (te(e))
    if (U(e))
      e.forEach((o) => po(o, t, s, i));
    else {
      const o = q(e.handler) ? e.handler.bind(s) : t[e.handler];
      q(o) && Js(n, o, e);
    }
}
function ho(e) {
  const t = e.type, { mixins: s, extends: i } = t, {
    mixins: n,
    optionsCache: o,
    config: { optionMergeStrategies: r }
  } = e.appContext, l = o.get(t);
  let c;
  return l ? c = l : !n.length && !s && !i ? c = t : (c = {}, n.length && n.forEach(
    (a) => As(c, a, r, !0)
  ), As(c, t, r)), te(t) && o.set(t, c), c;
}
function As(e, t, s, i = !1) {
  const { mixins: n, extends: o } = t;
  o && As(e, o, s, !0), n && n.forEach(
    (r) => As(e, r, s, !0)
  );
  for (const r in t)
    if (!(i && r === "expose")) {
      const l = sl[r] || s && s[r];
      e[r] = l ? l(e[r], t[r]) : t[r];
    }
  return e;
}
const sl = {
  data: zn,
  props: Xn,
  emits: Xn,
  // objects
  methods: Bt,
  computed: Bt,
  // lifecycle
  beforeCreate: be,
  created: be,
  beforeMount: be,
  mounted: be,
  beforeUpdate: be,
  updated: be,
  beforeDestroy: be,
  beforeUnmount: be,
  destroyed: be,
  unmounted: be,
  activated: be,
  deactivated: be,
  errorCaptured: be,
  serverPrefetch: be,
  // assets
  components: Bt,
  directives: Bt,
  // watch
  watch: il,
  // provide / inject
  provide: zn,
  inject: nl
};
function zn(e, t) {
  return t ? e ? function() {
    return ue(
      q(e) ? e.call(this, this) : e,
      q(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function nl(e, t) {
  return Bt(fn(e), fn(t));
}
function fn(e) {
  if (U(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++)
      t[e[s]] = e[s];
    return t;
  }
  return e;
}
function be(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Bt(e, t) {
  return e ? ue(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Xn(e, t) {
  return e ? U(e) && U(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ue(
    /* @__PURE__ */ Object.create(null),
    Jn(e),
    Jn(t ?? {})
  ) : t;
}
function il(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = ue(/* @__PURE__ */ Object.create(null), e);
  for (const i in t)
    s[i] = be(e[i], t[i]);
  return s;
}
function go() {
  return {
    app: null,
    config: {
      isNativeTag: $i,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let ol = 0;
function rl(e, t) {
  return function(i, n = null) {
    q(i) || (i = ue({}, i)), n != null && !te(n) && (n = null);
    const o = go(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let c = !1;
    const a = o.app = {
      _uid: ol++,
      _component: i,
      _props: n,
      _container: null,
      _context: o,
      _instance: null,
      version: Dl,
      get config() {
        return o.config;
      },
      set config(f) {
      },
      use(f, ...d) {
        return r.has(f) || (f && q(f.install) ? (r.add(f), f.install(a, ...d)) : q(f) && (r.add(f), f(a, ...d))), a;
      },
      mixin(f) {
        return o.mixins.includes(f) || o.mixins.push(f), a;
      },
      component(f, d) {
        return d ? (o.components[f] = d, a) : o.components[f];
      },
      directive(f, d) {
        return d ? (o.directives[f] = d, a) : o.directives[f];
      },
      mount(f, d, _) {
        if (!c) {
          const E = a._ceVNode || he(i, n);
          return E.appContext = o, _ === !0 ? _ = "svg" : _ === !1 && (_ = void 0), e(E, f, _), c = !0, a._container = f, f.__vue_app__ = a, js(E.component);
        }
      },
      onUnmount(f) {
        l.push(f);
      },
      unmount() {
        c && (Pe(
          l,
          a._instance,
          16
        ), e(null, a._container), delete a._container.__vue_app__);
      },
      provide(f, d) {
        return o.provides[f] = d, a;
      },
      runWithContext(f) {
        const d = It;
        It = a;
        try {
          return f();
        } finally {
          It = d;
        }
      }
    };
    return a;
  };
}
let It = null;
const ll = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ke(t)}Modifiers`] || e[`${xt(t)}Modifiers`];
function cl(e, t, ...s) {
  if (e.isUnmounted) return;
  const i = e.vnode.props || ie;
  let n = s;
  const o = t.startsWith("update:"), r = o && ll(i, t.slice(7));
  r && (r.trim && (n = s.map((f) => ce(f) ? f.trim() : f)), r.number && (n = s.map(yn)));
  let l, c = i[l = Bs(t)] || // also try camelCase event handler (#2249)
  i[l = Bs(ke(t))];
  !c && o && (c = i[l = Bs(xt(t))]), c && Pe(
    c,
    e,
    6,
    n
  );
  const a = i[l + "Once"];
  if (a) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Pe(
      a,
      e,
      6,
      n
    );
  }
}
const al = /* @__PURE__ */ new WeakMap();
function mo(e, t, s = !1) {
  const i = s ? al : t.emitsCache, n = i.get(e);
  if (n !== void 0)
    return n;
  const o = e.emits;
  let r = {}, l = !1;
  if (!q(e)) {
    const c = (a) => {
      const f = mo(a, t, !0);
      f && (l = !0, ue(r, f));
    };
    !s && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !o && !l ? (te(e) && i.set(e, null), null) : (U(o) ? o.forEach((c) => r[c] = null) : ue(r, o), te(e) && i.set(e, r), r);
}
function Vs(e, t) {
  return !e || !ks(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Z(e, t[0].toLowerCase() + t.slice(1)) || Z(e, xt(t)) || Z(e, t));
}
function Zn(e) {
  const {
    type: t,
    vnode: s,
    proxy: i,
    withProxy: n,
    propsOptions: [o],
    slots: r,
    attrs: l,
    emit: c,
    render: a,
    renderCache: f,
    props: d,
    data: _,
    setupState: E,
    ctx: j,
    inheritAttrs: F
  } = e, Y = Ts(e);
  let R, P;
  try {
    if (s.shapeFlag & 4) {
      const b = n || i, k = b;
      R = qe(
        a.call(
          k,
          b,
          f,
          d,
          E,
          _,
          j
        )
      ), P = l;
    } else {
      const b = t;
      R = qe(
        b.length > 1 ? b(
          d,
          { attrs: l, slots: r, emit: c }
        ) : b(
          d,
          null
        )
      ), P = t.props ? l : ul(l);
    }
  } catch (b) {
    zt.length = 0, Ns(b, e, 1), R = he(ze);
  }
  let T = R;
  if (P && F !== !1) {
    const b = Object.keys(P), { shapeFlag: k } = T;
    b.length && k & 7 && (o && b.some(Ms) && (P = fl(
      P,
      o
    )), T = Ct(T, P, !1, !0));
  }
  return s.dirs && (T = Ct(T, null, !1, !0), T.dirs = T.dirs ? T.dirs.concat(s.dirs) : s.dirs), s.transition && ss(T, s.transition), R = T, Ts(Y), R;
}
const ul = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || ks(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, fl = (e, t) => {
  const s = {};
  for (const i in e)
    (!Ms(i) || !(i.slice(9) in t)) && (s[i] = e[i]);
  return s;
};
function dl(e, t, s) {
  const { props: i, children: n, component: o } = e, { props: r, children: l, patchFlag: c } = t, a = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return i ? Qn(i, r, a) : !!r;
    if (c & 8) {
      const f = t.dynamicProps;
      for (let d = 0; d < f.length; d++) {
        const _ = f[d];
        if (_o(r, i, _) && !Vs(a, _))
          return !0;
      }
    }
  } else
    return (n || l) && (!l || !l.$stable) ? !0 : i === r ? !1 : i ? r ? Qn(i, r, a) : !0 : !!r;
  return !1;
}
function Qn(e, t, s) {
  const i = Object.keys(t);
  if (i.length !== Object.keys(e).length)
    return !0;
  for (let n = 0; n < i.length; n++) {
    const o = i[n];
    if (_o(t, e, o) && !Vs(s, o))
      return !0;
  }
  return !1;
}
function _o(e, t, s) {
  const i = e[s], n = t[s];
  return s === "style" && te(i) && te(n) ? !wn(i, n) : i !== n;
}
function pl({ vnode: e, parent: t, suspense: s }, i) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = i, e = n), n === e)
      (e = t.vnode).el = i, t = t.parent;
    else
      break;
  }
  s && s.activeBranch === e && (s.vnode.el = i);
}
const vo = {}, bo = () => Object.create(vo), yo = (e) => Object.getPrototypeOf(e) === vo;
function hl(e, t, s, i = !1) {
  const n = {}, o = bo();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), wo(e, t, n, o);
  for (const r in e.propsOptions[0])
    r in n || (n[r] = void 0);
  s ? e.props = i ? n : /* @__PURE__ */ wr(n) : e.type.props ? e.props = n : e.props = o, e.attrs = o;
}
function gl(e, t, s, i) {
  const {
    props: n,
    attrs: o,
    vnode: { patchFlag: r }
  } = e, l = /* @__PURE__ */ z(n), [c] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (i || r > 0) && !(r & 16)
  ) {
    if (r & 8) {
      const f = e.vnode.dynamicProps;
      for (let d = 0; d < f.length; d++) {
        let _ = f[d];
        if (Vs(e.emitsOptions, _))
          continue;
        const E = t[_];
        if (c)
          if (Z(o, _))
            E !== o[_] && (o[_] = E, a = !0);
          else {
            const j = ke(_);
            n[j] = dn(
              c,
              l,
              j,
              E,
              e,
              !1
            );
          }
        else
          E !== o[_] && (o[_] = E, a = !0);
      }
    }
  } else {
    wo(e, t, n, o) && (a = !0);
    let f;
    for (const d in l)
      (!t || // for camelCase
      !Z(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((f = xt(d)) === d || !Z(t, f))) && (c ? s && // for camelCase
      (s[d] !== void 0 || // for kebab-case
      s[f] !== void 0) && (n[d] = dn(
        c,
        l,
        d,
        void 0,
        e,
        !0
      )) : delete n[d]);
    if (o !== l)
      for (const d in o)
        (!t || !Z(t, d)) && (delete o[d], a = !0);
  }
  a && tt(e.attrs, "set", "");
}
function wo(e, t, s, i) {
  const [n, o] = e.propsOptions;
  let r = !1, l;
  if (t)
    for (let c in t) {
      if (Wt(c))
        continue;
      const a = t[c];
      let f;
      n && Z(n, f = ke(c)) ? !o || !o.includes(f) ? s[f] = a : (l || (l = {}))[f] = a : Vs(e.emitsOptions, c) || (!(c in i) || a !== i[c]) && (i[c] = a, r = !0);
    }
  if (o) {
    const c = /* @__PURE__ */ z(s), a = l || ie;
    for (let f = 0; f < o.length; f++) {
      const d = o[f];
      s[d] = dn(
        n,
        c,
        d,
        a[d],
        e,
        !Z(a, d)
      );
    }
  }
  return r;
}
function dn(e, t, s, i, n, o) {
  const r = e[s];
  if (r != null) {
    const l = Z(r, "default");
    if (l && i === void 0) {
      const c = r.default;
      if (r.type !== Function && !r.skipFactory && q(c)) {
        const { propsDefaults: a } = n;
        if (s in a)
          i = a[s];
        else {
          const f = cs(n);
          i = a[s] = c.call(
            null,
            t
          ), f();
        }
      } else
        i = c;
      n.ce && n.ce._setProp(s, i);
    }
    r[
      0
      /* shouldCast */
    ] && (o && !l ? i = !1 : r[
      1
      /* shouldCastTrue */
    ] && (i === "" || i === xt(s)) && (i = !0));
  }
  return i;
}
const ml = /* @__PURE__ */ new WeakMap();
function Co(e, t, s = !1) {
  const i = s ? ml : t.propsCache, n = i.get(e);
  if (n)
    return n;
  const o = e.props, r = {}, l = [];
  let c = !1;
  if (!q(e)) {
    const f = (d) => {
      c = !0;
      const [_, E] = Co(d, t, !0);
      ue(r, _), E && l.push(...E);
    };
    !s && t.mixins.length && t.mixins.forEach(f), e.extends && f(e.extends), e.mixins && e.mixins.forEach(f);
  }
  if (!o && !c)
    return te(e) && i.set(e, Ot), Ot;
  if (U(o))
    for (let f = 0; f < o.length; f++) {
      const d = ke(o[f]);
      ei(d) && (r[d] = ie);
    }
  else if (o)
    for (const f in o) {
      const d = ke(f);
      if (ei(d)) {
        const _ = o[f], E = r[d] = U(_) || q(_) ? { type: _ } : ue({}, _), j = E.type;
        let F = !1, Y = !0;
        if (U(j))
          for (let R = 0; R < j.length; ++R) {
            const P = j[R], T = q(P) && P.name;
            if (T === "Boolean") {
              F = !0;
              break;
            } else T === "String" && (Y = !1);
          }
        else
          F = q(j) && j.name === "Boolean";
        E[
          0
          /* shouldCast */
        ] = F, E[
          1
          /* shouldCastTrue */
        ] = Y, (F || Z(E, "default")) && l.push(d);
      }
    }
  const a = [r, l];
  return te(e) && i.set(e, a), a;
}
function ei(e) {
  return e[0] !== "$" && !Wt(e);
}
const Pn = (e) => e === "_" || e === "_ctx" || e === "$stable", kn = (e) => U(e) ? e.map(qe) : [qe(e)], _l = (e, t, s) => {
  if (t._n)
    return t;
  const i = rt((...n) => kn(t(...n)), s);
  return i._c = !1, i;
}, xo = (e, t, s) => {
  const i = e._ctx;
  for (const n in e) {
    if (Pn(n)) continue;
    const o = e[n];
    if (q(o))
      t[n] = _l(n, o, i);
    else if (o != null) {
      const r = kn(o);
      t[n] = () => r;
    }
  }
}, Eo = (e, t) => {
  const s = kn(t);
  e.slots.default = () => s;
}, So = (e, t, s) => {
  for (const i in t)
    (s || !Pn(i)) && (e[i] = t[i]);
}, vl = (e, t, s) => {
  const i = e.slots = bo();
  if (e.vnode.shapeFlag & 32) {
    const n = t._;
    n ? (So(i, t, s), s && Ii(i, "_", n, !0)) : xo(t, i);
  } else t && Eo(e, t);
}, bl = (e, t, s) => {
  const { vnode: i, slots: n } = e;
  let o = !0, r = ie;
  if (i.shapeFlag & 32) {
    const l = t._;
    l ? s && l === 1 ? o = !1 : So(n, t, s) : (o = !t.$stable, xo(t, n)), r = t;
  } else t && (Eo(e, t), r = { default: 1 });
  if (o)
    for (const l in n)
      !Pn(l) && r[l] == null && delete n[l];
}, xe = El;
function yl(e) {
  return wl(e);
}
function wl(e, t) {
  const s = Rs();
  s.__VUE__ = !0;
  const {
    insert: i,
    remove: n,
    patchProp: o,
    createElement: r,
    createText: l,
    createComment: c,
    setText: a,
    setElementText: f,
    parentNode: d,
    nextSibling: _,
    setScopeId: E = Je,
    insertStaticContent: j
  } = e, F = (u, p, h, x = null, w = null, y = null, O = void 0, A = null, $ = !!p.dynamicChildren) => {
    if (u === p)
      return;
    u && !Tt(u, p) && (x = hs(u), Le(u, w, y, !0), u = null), p.patchFlag === -2 && ($ = !1, p.dynamicChildren = null);
    const { type: C, ref: H, shapeFlag: M } = p;
    switch (C) {
      case Hs:
        Y(u, p, h, x);
        break;
      case ze:
        R(u, p, h, x);
        break;
      case Xs:
        u == null && P(p, h, x, O);
        break;
      case X:
        m(
          u,
          p,
          h,
          x,
          w,
          y,
          O,
          A,
          $
        );
        break;
      default:
        M & 1 ? k(
          u,
          p,
          h,
          x,
          w,
          y,
          O,
          A,
          $
        ) : M & 6 ? ee(
          u,
          p,
          h,
          x,
          w,
          y,
          O,
          A,
          $
        ) : (M & 64 || M & 128) && C.process(
          u,
          p,
          h,
          x,
          w,
          y,
          O,
          A,
          $,
          Dt
        );
    }
    H != null && w ? Jt(H, u && u.ref, y, p || u, !p) : H == null && u && u.ref != null && Jt(u.ref, null, y, u, !0);
  }, Y = (u, p, h, x) => {
    if (u == null)
      i(
        p.el = l(p.children),
        h,
        x
      );
    else {
      const w = p.el = u.el;
      p.children !== u.children && a(w, p.children);
    }
  }, R = (u, p, h, x) => {
    u == null ? i(
      p.el = c(p.children || ""),
      h,
      x
    ) : p.el = u.el;
  }, P = (u, p, h, x) => {
    [u.el, u.anchor] = j(
      u.children,
      p,
      h,
      x,
      u.el,
      u.anchor
    );
  }, T = ({ el: u, anchor: p }, h, x) => {
    let w;
    for (; u && u !== p; )
      w = _(u), i(u, h, x), u = w;
    i(p, h, x);
  }, b = ({ el: u, anchor: p }) => {
    let h;
    for (; u && u !== p; )
      h = _(u), n(u), u = h;
    n(p);
  }, k = (u, p, h, x, w, y, O, A, $) => {
    if (p.type === "svg" ? O = "svg" : p.type === "math" && (O = "mathml"), u == null)
      S(
        p,
        h,
        x,
        w,
        y,
        O,
        A,
        $
      );
    else {
      const C = u.el && u.el._isVueCE ? u.el : null;
      try {
        C && C._beginPatch(), N(
          u,
          p,
          w,
          y,
          O,
          A,
          $
        );
      } finally {
        C && C._endPatch();
      }
    }
  }, S = (u, p, h, x, w, y, O, A) => {
    let $, C;
    const { props: H, shapeFlag: M, transition: V, dirs: K } = u;
    if ($ = u.el = r(
      u.type,
      y,
      H && H.is,
      H
    ), M & 8 ? f($, u.children) : M & 16 && B(
      u.children,
      $,
      null,
      x,
      w,
      zs(u, y),
      O,
      A
    ), K && mt(u, null, x, "created"), v($, u, u.scopeId, O, x), H) {
      for (const ne in H)
        ne !== "value" && !Wt(ne) && o($, ne, null, H[ne], y, x);
      "value" in H && o($, "value", null, H.value, y), (C = H.onVnodeBeforeMount) && Ve(C, x, u);
    }
    K && mt(u, null, x, "beforeMount");
    const J = Cl(w, V);
    J && V.beforeEnter($), i($, p, h), ((C = H && H.onVnodeMounted) || J || K) && xe(() => {
      try {
        C && Ve(C, x, u), J && V.enter($), K && mt(u, null, x, "mounted");
      } finally {
      }
    }, w);
  }, v = (u, p, h, x, w) => {
    if (h && E(u, h), x)
      for (let y = 0; y < x.length; y++)
        E(u, x[y]);
    if (w) {
      let y = w.subTree;
      if (p === y || Oo(y.type) && (y.ssContent === p || y.ssFallback === p)) {
        const O = w.vnode;
        v(
          u,
          O,
          O.scopeId,
          O.slotScopeIds,
          w.parent
        );
      }
    }
  }, B = (u, p, h, x, w, y, O, A, $ = 0) => {
    for (let C = $; C < u.length; C++) {
      const H = u[C] = A ? et(u[C]) : qe(u[C]);
      F(
        null,
        H,
        p,
        h,
        x,
        w,
        y,
        O,
        A
      );
    }
  }, N = (u, p, h, x, w, y, O) => {
    const A = p.el = u.el;
    let { patchFlag: $, dynamicChildren: C, dirs: H } = p;
    $ |= u.patchFlag & 16;
    const M = u.props || ie, V = p.props || ie;
    let K;
    if (h && _t(h, !1), (K = V.onVnodeBeforeUpdate) && Ve(K, h, p, u), H && mt(p, u, h, "beforeUpdate"), h && _t(h, !0), (M.innerHTML && V.innerHTML == null || M.textContent && V.textContent == null) && f(A, ""), C ? G(
      u.dynamicChildren,
      C,
      A,
      h,
      x,
      zs(p, w),
      y
    ) : O || oe(
      u,
      p,
      A,
      null,
      h,
      x,
      zs(p, w),
      y,
      !1
    ), $ > 0) {
      if ($ & 16)
        Q(A, M, V, h, w);
      else if ($ & 2 && M.class !== V.class && o(A, "class", null, V.class, w), $ & 4 && o(A, "style", M.style, V.style, w), $ & 8) {
        const J = p.dynamicProps;
        for (let ne = 0; ne < J.length; ne++) {
          const se = J[ne], ae = M[se], de = V[se];
          (de !== ae || se === "value") && o(A, se, ae, de, w, h);
        }
      }
      $ & 1 && u.children !== p.children && f(A, p.children);
    } else !O && C == null && Q(A, M, V, h, w);
    ((K = V.onVnodeUpdated) || H) && xe(() => {
      K && Ve(K, h, p, u), H && mt(p, u, h, "updated");
    }, x);
  }, G = (u, p, h, x, w, y, O) => {
    for (let A = 0; A < p.length; A++) {
      const $ = u[A], C = p[A], H = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        $.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        ($.type === X || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Tt($, C) || // - In the case of a component, it could contain anything.
        $.shapeFlag & 198) ? d($.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      F(
        $,
        C,
        H,
        null,
        x,
        w,
        y,
        O,
        !0
      );
    }
  }, Q = (u, p, h, x, w) => {
    if (p !== h) {
      if (p !== ie)
        for (const y in p)
          !Wt(y) && !(y in h) && o(
            u,
            y,
            p[y],
            null,
            w,
            x
          );
      for (const y in h) {
        if (Wt(y)) continue;
        const O = h[y], A = p[y];
        O !== A && y !== "value" && o(u, y, A, O, w, x);
      }
      "value" in h && o(u, "value", p.value, h.value, w);
    }
  }, m = (u, p, h, x, w, y, O, A, $) => {
    const C = p.el = u ? u.el : l(""), H = p.anchor = u ? u.anchor : l("");
    let { patchFlag: M, dynamicChildren: V, slotScopeIds: K } = p;
    K && (A = A ? A.concat(K) : K), u == null ? (i(C, h, x), i(H, h, x), B(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      h,
      H,
      w,
      y,
      O,
      A,
      $
    )) : M > 0 && M & 64 && V && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    u.dynamicChildren && u.dynamicChildren.length === V.length ? (G(
      u.dynamicChildren,
      V,
      h,
      w,
      y,
      O,
      A
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || w && p === w.subTree) && To(
      u,
      p,
      !0
      /* shallow */
    )) : oe(
      u,
      p,
      h,
      H,
      w,
      y,
      O,
      A,
      $
    );
  }, ee = (u, p, h, x, w, y, O, A, $) => {
    p.slotScopeIds = A, u == null ? p.shapeFlag & 512 ? w.ctx.activate(
      p,
      h,
      x,
      O,
      $
    ) : ge(
      p,
      h,
      x,
      w,
      y,
      O,
      $
    ) : Xe(u, p, $);
  }, ge = (u, p, h, x, w, y, O) => {
    const A = u.component = kl(
      u,
      x,
      w
    );
    if (lo(u) && (A.ctx.renderer = Dt), Ml(A, !1, O), A.asyncDep) {
      if (w && w.registerDep(A, fe, O), !u.el) {
        const $ = A.subTree = he(ze);
        R(null, $, p, h), u.placeholder = $.el;
      }
    } else
      fe(
        A,
        u,
        p,
        h,
        w,
        y,
        O
      );
  }, Xe = (u, p, h) => {
    const x = p.component = u.component;
    if (dl(u, p, h))
      if (x.asyncDep && !x.asyncResolved) {
        le(x, p, h);
        return;
      } else
        x.next = p, x.update();
    else
      p.el = u.el, x.vnode = p;
  }, fe = (u, p, h, x, w, y, O) => {
    const A = () => {
      if (u.isMounted) {
        let { next: M, bu: V, u: K, parent: J, vnode: ne } = u;
        {
          const Ne = $o(u);
          if (Ne) {
            M && (M.el = ne.el, le(u, M, O)), Ne.asyncDep.then(() => {
              xe(() => {
                u.isUnmounted || C();
              }, w);
            });
            return;
          }
        }
        let se = M, ae;
        _t(u, !1), M ? (M.el = ne.el, le(u, M, O)) : M = ne, V && ws(V), (ae = M.props && M.props.onVnodeBeforeUpdate) && Ve(ae, J, M, ne), _t(u, !0);
        const de = Zn(u), Fe = u.subTree;
        u.subTree = de, F(
          Fe,
          de,
          // parent may have changed if it's in a teleport
          d(Fe.el),
          // anchor may have changed if it's in a fragment
          hs(Fe),
          u,
          w,
          y
        ), M.el = de.el, se === null && pl(u, de.el), K && xe(K, w), (ae = M.props && M.props.onVnodeUpdated) && xe(
          () => Ve(ae, J, M, ne),
          w
        );
      } else {
        let M;
        const { el: V, props: K } = p, { bm: J, m: ne, parent: se, root: ae, type: de } = u, Fe = Mt(p);
        _t(u, !1), J && ws(J), !Fe && (M = K && K.onVnodeBeforeMount) && Ve(M, se, p), _t(u, !0);
        {
          ae.ce && ae.ce._hasShadowRoot() && ae.ce._injectChildStyle(
            de,
            u.parent ? u.parent.type : void 0
          );
          const Ne = u.subTree = Zn(u);
          F(
            null,
            Ne,
            h,
            x,
            u,
            w,
            y
          ), p.el = Ne.el;
        }
        if (ne && xe(ne, w), !Fe && (M = K && K.onVnodeMounted)) {
          const Ne = p;
          xe(
            () => Ve(M, se, Ne),
            w
          );
        }
        (p.shapeFlag & 256 || se && Mt(se.vnode) && se.vnode.shapeFlag & 256) && u.a && xe(u.a, w), u.isMounted = !0, p = h = x = null;
      }
    };
    u.scope.on();
    const $ = u.effect = new Ni(A);
    u.scope.off();
    const C = u.update = $.run.bind($), H = u.job = $.runIfDirty.bind($);
    H.i = u, H.id = u.uid, $.scheduler = () => On(H), _t(u, !0), C();
  }, le = (u, p, h) => {
    p.component = u;
    const x = u.vnode.props;
    u.vnode = p, u.next = null, gl(u, p.props, x, h), bl(u, p.children, h), nt(), Kn(u), it();
  }, oe = (u, p, h, x, w, y, O, A, $ = !1) => {
    const C = u && u.children, H = u ? u.shapeFlag : 0, M = p.children, { patchFlag: V, shapeFlag: K } = p;
    if (V > 0) {
      if (V & 128) {
        ps(
          C,
          M,
          h,
          x,
          w,
          y,
          O,
          A,
          $
        );
        return;
      } else if (V & 256) {
        ht(
          C,
          M,
          h,
          x,
          w,
          y,
          O,
          A,
          $
        );
        return;
      }
    }
    K & 8 ? (H & 16 && Nt(C, w, y), M !== C && f(h, M)) : H & 16 ? K & 16 ? ps(
      C,
      M,
      h,
      x,
      w,
      y,
      O,
      A,
      $
    ) : Nt(C, w, y, !0) : (H & 8 && f(h, ""), K & 16 && B(
      M,
      h,
      x,
      w,
      y,
      O,
      A,
      $
    ));
  }, ht = (u, p, h, x, w, y, O, A, $) => {
    u = u || Ot, p = p || Ot;
    const C = u.length, H = p.length, M = Math.min(C, H);
    let V;
    for (V = 0; V < M; V++) {
      const K = p[V] = $ ? et(p[V]) : qe(p[V]);
      F(
        u[V],
        K,
        h,
        null,
        w,
        y,
        O,
        A,
        $
      );
    }
    C > H ? Nt(
      u,
      w,
      y,
      !0,
      !1,
      M
    ) : B(
      p,
      h,
      x,
      w,
      y,
      O,
      A,
      $,
      M
    );
  }, ps = (u, p, h, x, w, y, O, A, $) => {
    let C = 0;
    const H = p.length;
    let M = u.length - 1, V = H - 1;
    for (; C <= M && C <= V; ) {
      const K = u[C], J = p[C] = $ ? et(p[C]) : qe(p[C]);
      if (Tt(K, J))
        F(
          K,
          J,
          h,
          null,
          w,
          y,
          O,
          A,
          $
        );
      else
        break;
      C++;
    }
    for (; C <= M && C <= V; ) {
      const K = u[M], J = p[V] = $ ? et(p[V]) : qe(p[V]);
      if (Tt(K, J))
        F(
          K,
          J,
          h,
          null,
          w,
          y,
          O,
          A,
          $
        );
      else
        break;
      M--, V--;
    }
    if (C > M) {
      if (C <= V) {
        const K = V + 1, J = K < H ? p[K].el : x;
        for (; C <= V; )
          F(
            null,
            p[C] = $ ? et(p[C]) : qe(p[C]),
            h,
            J,
            w,
            y,
            O,
            A,
            $
          ), C++;
      }
    } else if (C > V)
      for (; C <= M; )
        Le(u[C], w, y, !0), C++;
    else {
      const K = C, J = C, ne = /* @__PURE__ */ new Map();
      for (C = J; C <= V; C++) {
        const Se = p[C] = $ ? et(p[C]) : qe(p[C]);
        Se.key != null && ne.set(Se.key, C);
      }
      let se, ae = 0;
      const de = V - J + 1;
      let Fe = !1, Ne = 0;
      const Vt = new Array(de);
      for (C = 0; C < de; C++) Vt[C] = 0;
      for (C = K; C <= M; C++) {
        const Se = u[C];
        if (ae >= de) {
          Le(Se, w, y, !0);
          continue;
        }
        let De;
        if (Se.key != null)
          De = ne.get(Se.key);
        else
          for (se = J; se <= V; se++)
            if (Vt[se - J] === 0 && Tt(Se, p[se])) {
              De = se;
              break;
            }
        De === void 0 ? Le(Se, w, y, !0) : (Vt[De - J] = C + 1, De >= Ne ? Ne = De : Fe = !0, F(
          Se,
          p[De],
          h,
          null,
          w,
          y,
          O,
          A,
          $
        ), ae++);
      }
      const Nn = Fe ? xl(Vt) : Ot;
      for (se = Nn.length - 1, C = de - 1; C >= 0; C--) {
        const Se = J + C, De = p[Se], Dn = p[Se + 1], Vn = Se + 1 < H ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          Dn.el || Ao(Dn)
        ) : x;
        Vt[C] === 0 ? F(
          null,
          De,
          h,
          Vn,
          w,
          y,
          O,
          A,
          $
        ) : Fe && (se < 0 || C !== Nn[se] ? gt(De, h, Vn, 2) : se--);
      }
    }
  }, gt = (u, p, h, x, w = null) => {
    const { el: y, type: O, transition: A, children: $, shapeFlag: C } = u;
    if (C & 6) {
      gt(u.component.subTree, p, h, x);
      return;
    }
    if (C & 128) {
      u.suspense.move(p, h, x);
      return;
    }
    if (C & 64) {
      O.move(u, p, h, Dt);
      return;
    }
    if (O === X) {
      i(y, p, h);
      for (let M = 0; M < $.length; M++)
        gt($[M], p, h, x);
      i(u.anchor, p, h);
      return;
    }
    if (O === Xs) {
      T(u, p, h);
      return;
    }
    if (x !== 2 && C & 1 && A)
      if (x === 0)
        A.persisted && !y[Be] ? i(y, p, h) : (A.beforeEnter(y), i(y, p, h), xe(() => A.enter(y), w));
      else {
        const { leave: M, delayLeave: V, afterLeave: K } = A, J = () => {
          u.ctx.isUnmounted ? n(y) : i(y, p, h);
        }, ne = () => {
          const se = y._isLeaving || !!y[Be];
          y._isLeaving && y[Be](
            !0
            /* cancelled */
          ), A.persisted && !se ? J() : M(y, () => {
            J(), K && K();
          });
        };
        V ? V(y, J, ne) : ne();
      }
    else
      i(y, p, h);
  }, Le = (u, p, h, x = !1, w = !1) => {
    const {
      type: y,
      props: O,
      ref: A,
      children: $,
      dynamicChildren: C,
      shapeFlag: H,
      patchFlag: M,
      dirs: V,
      cacheIndex: K,
      memo: J
    } = u;
    if (M === -2 && (w = !1), A != null && (nt(), Jt(A, null, h, u, !0), it()), K != null && (p.renderCache[K] = void 0), H & 256) {
      p.ctx.deactivate(u);
      return;
    }
    const ne = H & 1 && V, se = !Mt(u);
    let ae;
    if (se && (ae = O && O.onVnodeBeforeUnmount) && Ve(ae, p, u), H & 6)
      Bo(u.component, h, x);
    else {
      if (H & 128) {
        u.suspense.unmount(h, x);
        return;
      }
      ne && mt(u, null, p, "beforeUnmount"), H & 64 ? u.type.remove(
        u,
        p,
        h,
        Dt,
        x
      ) : C && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !C.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (y !== X || M > 0 && M & 64) ? Nt(
        C,
        p,
        h,
        !1,
        !0
      ) : (y === X && M & 384 || !w && H & 16) && Nt($, p, h), x && Ln(u);
    }
    const de = J != null && K == null;
    (se && (ae = O && O.onVnodeUnmounted) || ne || de) && xe(() => {
      ae && Ve(ae, p, u), ne && mt(u, null, p, "unmounted"), de && (u.el = null);
    }, h);
  }, Ln = (u) => {
    const { type: p, el: h, anchor: x, transition: w } = u;
    if (p === X) {
      Uo(h, x);
      return;
    }
    if (p === Xs) {
      b(u);
      return;
    }
    const y = () => {
      n(h), w && !w.persisted && w.afterLeave && w.afterLeave();
    };
    if (u.shapeFlag & 1 && w && !w.persisted) {
      const { leave: O, delayLeave: A } = w, $ = () => O(h, y);
      A ? A(u.el, y, $) : $();
    } else
      y();
  }, Uo = (u, p) => {
    let h;
    for (; u !== p; )
      h = _(u), n(u), u = h;
    n(p);
  }, Bo = (u, p, h) => {
    const { bum: x, scope: w, job: y, subTree: O, um: A, m: $, a: C } = u;
    ti($), ti(C), x && ws(x), w.stop(), y && (y.flags |= 8, Le(O, u, p, h)), A && xe(A, p), xe(() => {
      u.isUnmounted = !0;
    }, p);
  }, Nt = (u, p, h, x = !1, w = !1, y = 0) => {
    for (let O = y; O < u.length; O++)
      Le(u[O], p, h, x, w);
  }, hs = (u) => {
    if (u.shapeFlag & 6)
      return hs(u.component.subTree);
    if (u.shapeFlag & 128)
      return u.suspense.next();
    const p = _(u.anchor || u.el), h = p && p[Dr];
    return h ? _(h) : p;
  };
  let Us = !1;
  const Fn = (u, p, h) => {
    let x;
    u == null ? p._vnode && (Le(p._vnode, null, null, !0), x = p._vnode.component) : F(
      p._vnode || null,
      u,
      p,
      null,
      null,
      null,
      h
    ), p._vnode = u, Us || (Us = !0, Kn(x), eo(), Us = !1);
  }, Dt = {
    p: F,
    um: Le,
    m: gt,
    r: Ln,
    mt: ge,
    mc: B,
    pc: oe,
    pbc: G,
    n: hs,
    o: e
  };
  return {
    render: Fn,
    hydrate: void 0,
    createApp: rl(Fn)
  };
}
function zs({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function _t({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Cl(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function To(e, t, s = !1) {
  const i = e.children, n = t.children;
  if (U(i) && U(n))
    for (let o = 0; o < i.length; o++) {
      const r = i[o];
      let l = n[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = n[o] = et(n[o]), l.el = r.el), !s && l.patchFlag !== -2 && To(r, l)), l.type === Hs && (l.patchFlag === -1 && (l = n[o] = et(l)), l.el = r.el), l.type === ze && !l.el && (l.el = r.el);
    }
}
function xl(e) {
  const t = e.slice(), s = [0];
  let i, n, o, r, l;
  const c = e.length;
  for (i = 0; i < c; i++) {
    const a = e[i];
    if (a !== 0) {
      if (n = s[s.length - 1], e[n] < a) {
        t[i] = n, s.push(i);
        continue;
      }
      for (o = 0, r = s.length - 1; o < r; )
        l = o + r >> 1, e[s[l]] < a ? o = l + 1 : r = l;
      a < e[s[o]] && (o > 0 && (t[i] = s[o - 1]), s[o] = i);
    }
  }
  for (o = s.length, r = s[o - 1]; o-- > 0; )
    s[o] = r, r = t[r];
  return s;
}
function $o(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : $o(t);
}
function ti(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function Ao(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? Ao(t.subTree) : null;
}
const Oo = (e) => e.__isSuspense;
function El(e, t) {
  t && t.pendingBranch ? U(e) ? t.effects.push(...e) : t.effects.push(e) : Ir(e);
}
const X = /* @__PURE__ */ Symbol.for("v-fgt"), Hs = /* @__PURE__ */ Symbol.for("v-txt"), ze = /* @__PURE__ */ Symbol.for("v-cmt"), Xs = /* @__PURE__ */ Symbol.for("v-stc"), zt = [];
let $e = null;
function D(e = !1) {
  zt.push($e = e ? null : []);
}
function Sl() {
  zt.pop(), $e = zt[zt.length - 1] || null;
}
let ns = 1;
function si(e, t = !1) {
  ns += e, e < 0 && $e && t && ($e.hasOnce = !0);
}
function Po(e) {
  return e.dynamicChildren = ns > 0 ? $e || Ot : null, Sl(), ns > 0 && $e && $e.push(e), e;
}
function W(e, t, s, i, n, o) {
  return Po(
    g(
      e,
      t,
      s,
      i,
      n,
      o,
      !0
    )
  );
}
function ft(e, t, s, i, n) {
  return Po(
    he(
      e,
      t,
      s,
      i,
      n,
      !0
    )
  );
}
function Mn(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Tt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const ko = ({ key: e }) => e ?? null, xs = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? ce(e) || /* @__PURE__ */ ve(e) || q(e) ? { i: _e, r: e, k: t, f: !!s } : e : null);
function g(e, t = null, s = null, i = 0, n = null, o = e === X ? 0 : 1, r = !1, l = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && ko(t),
    ref: t && xs(t),
    scopeId: so,
    slotScopeIds: null,
    children: s,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: i,
    dynamicProps: n,
    dynamicChildren: null,
    appContext: null,
    ctx: _e
  };
  return l ? (In(c, s), o & 128 && e.normalize(c)) : s && (c.shapeFlag |= ce(s) ? 8 : 16), ns > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  $e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && $e.push(c), c;
}
const he = Tl;
function Tl(e, t = null, s = null, i = 0, n = null, o = !1) {
  if ((!e || e === Zr) && (e = ze), Mn(e)) {
    const l = Ct(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && In(l, s), ns > 0 && !o && $e && (l.shapeFlag & 6 ? $e[$e.indexOf(e)] = l : $e.push(l)), l.patchFlag = -2, l;
  }
  if (Fl(e) && (e = e.__vccOpts), t) {
    t = $l(t);
    let { class: l, style: c } = t;
    l && !ce(l) && (t.class = Ce(l)), te(c) && (/* @__PURE__ */ An(c) && !U(c) && (c = ue({}, c)), t.style = Ls(c));
  }
  const r = ce(e) ? 1 : Oo(e) ? 128 : Vr(e) ? 64 : te(e) ? 4 : q(e) ? 2 : 0;
  return g(
    e,
    t,
    s,
    i,
    n,
    r,
    o,
    !0
  );
}
function $l(e) {
  return e ? /* @__PURE__ */ An(e) || yo(e) ? ue({}, e) : e : null;
}
function Ct(e, t, s = !1, i = !1) {
  const { props: n, ref: o, patchFlag: r, children: l, transition: c } = e, a = t ? Al(n || {}, t) : n, f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && ko(a),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && o ? U(o) ? o.concat(xs(t)) : [o, xs(t)] : xs(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== X ? r === -1 ? 16 : r | 16 : r,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: c,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Ct(e.ssContent),
    ssFallback: e.ssFallback && Ct(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && i && ss(
    f,
    c.clone(f)
  ), f;
}
function At(e = " ", t = 0) {
  return he(Hs, null, e, t);
}
function Rt(e = "", t = !1) {
  return t ? (D(), ft(ze, null, e)) : he(ze, null, e);
}
function qe(e) {
  return e == null || typeof e == "boolean" ? he(ze) : U(e) ? he(
    X,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Mn(e) ? et(e) : he(Hs, null, String(e));
}
function et(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ct(e);
}
function In(e, t) {
  let s = 0;
  const { shapeFlag: i } = e;
  if (t == null)
    t = null;
  else if (U(t))
    s = 16;
  else if (typeof t == "object")
    if (i & 65) {
      const n = t.default;
      n && (n._c && (n._d = !1), In(e, n()), n._c && (n._d = !0));
      return;
    } else {
      s = 32;
      const n = t._;
      !n && !yo(t) ? t._ctx = _e : n === 3 && _e && (_e.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else q(t) ? (t = { default: t, _ctx: _e }, s = 32) : (t = String(t), i & 64 ? (s = 16, t = [At(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Al(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const i = e[s];
    for (const n in i)
      if (n === "class")
        t.class !== i.class && (t.class = Ce([t.class, i.class]));
      else if (n === "style")
        t.style = Ls([t.style, i.style]);
      else if (ks(n)) {
        const o = t[n], r = i[n];
        r && o !== r && !(U(o) && o.includes(r)) ? t[n] = o ? [].concat(o, r) : r : r == null && o == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !Ms(n) && (t[n] = r);
      } else n !== "" && (t[n] = i[n]);
  }
  return t;
}
function Ve(e, t, s, i = null) {
  Pe(e, t, 7, [
    s,
    i
  ]);
}
const Ol = go();
let Pl = 0;
function kl(e, t, s) {
  const i = e.type, n = (t ? t.appContext : e.appContext) || Ol, o = {
    uid: Pl++,
    vnode: e,
    type: i,
    parent: t,
    appContext: n,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new sr(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(n.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Co(i, n),
    emitsOptions: mo(i, n),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ie,
    // inheritAttrs
    inheritAttrs: i.inheritAttrs,
    // state
    ctx: ie,
    data: ie,
    props: ie,
    attrs: ie,
    slots: ie,
    refs: ie,
    setupState: ie,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = cl.bind(null, o), e.ce && e.ce(o), o;
}
let we = null;
const Mo = () => we || _e;
let Os, pn;
{
  const e = Rs(), t = (s, i) => {
    let n;
    return (n = e[s]) || (n = e[s] = []), n.push(i), (o) => {
      n.length > 1 ? n.forEach((r) => r(o)) : n[0](o);
    };
  };
  Os = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => we = s
  ), pn = t(
    "__VUE_SSR_SETTERS__",
    (s) => is = s
  );
}
const cs = (e) => {
  const t = we;
  return Os(e), e.scope.on(), () => {
    e.scope.off(), Os(t);
  };
}, ni = () => {
  we && we.scope.off(), Os(null);
};
function Io(e) {
  return e.vnode.shapeFlag & 4;
}
let is = !1;
function Ml(e, t = !1, s = !1) {
  t && pn(t);
  const { props: i, children: n } = e.vnode, o = Io(e);
  hl(e, i, o, t), vl(e, n, s || t);
  const r = o ? Il(e, t) : void 0;
  return t && pn(!1), r;
}
function Il(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Qr);
  const { setup: i } = s;
  if (i) {
    nt();
    const n = e.setupContext = i.length > 1 ? Ll(e) : null, o = cs(e), r = rs(
      i,
      e,
      0,
      [
        e.props,
        n
      ]
    ), l = Oi(r);
    if (it(), o(), (l || e.sp) && !Mt(e) && ro(e), l) {
      if (r.then(ni, ni), t)
        return r.then((c) => {
          ii(e, c);
        }).catch((c) => {
          Ns(c, e, 0);
        });
      e.asyncDep = r;
    } else
      ii(e, r);
  } else
    Ro(e);
}
function ii(e, t, s) {
  q(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : te(t) && (e.setupState = Xi(t)), Ro(e);
}
function Ro(e, t, s) {
  const i = e.type;
  e.render || (e.render = i.render || Je);
  {
    const n = cs(e);
    nt();
    try {
      el(e);
    } finally {
      it(), n();
    }
  }
}
const Rl = {
  get(e, t) {
    return me(e, "get", ""), e[t];
  }
};
function Ll(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, Rl),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function js(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Xi(Cr(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in Yt)
        return Yt[s](e);
    },
    has(t, s) {
      return s in t || s in Yt;
    }
  })) : e.proxy;
}
function Fl(e) {
  return q(e) && "__vccOpts" in e;
}
const Nl = (e, t) => /* @__PURE__ */ $r(e, t, is), Dl = "3.5.35";
/**
* @vue/runtime-dom v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let hn;
const oi = typeof window < "u" && window.trustedTypes;
if (oi)
  try {
    hn = /* @__PURE__ */ oi.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Lo = hn ? (e) => hn.createHTML(e) : (e) => e, Vl = "http://www.w3.org/2000/svg", Hl = "http://www.w3.org/1998/Math/MathML", Qe = typeof document < "u" ? document : null, ri = Qe && /* @__PURE__ */ Qe.createElement("template"), jl = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, i) => {
    const n = t === "svg" ? Qe.createElementNS(Vl, e) : t === "mathml" ? Qe.createElementNS(Hl, e) : s ? Qe.createElement(e, { is: s }) : Qe.createElement(e);
    return e === "select" && i && i.multiple != null && n.setAttribute("multiple", i.multiple), n;
  },
  createText: (e) => Qe.createTextNode(e),
  createComment: (e) => Qe.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Qe.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, i, n, o) {
    const r = s ? s.previousSibling : t.lastChild;
    if (n && (n === o || n.nextSibling))
      for (; t.insertBefore(n.cloneNode(!0), s), !(n === o || !(n = n.nextSibling)); )
        ;
    else {
      ri.innerHTML = Lo(
        i === "svg" ? `<svg>${e}</svg>` : i === "mathml" ? `<math>${e}</math>` : e
      );
      const l = ri.content;
      if (i === "svg" || i === "mathml") {
        const c = l.firstChild;
        for (; c.firstChild; )
          l.appendChild(c.firstChild);
        l.removeChild(c);
      }
      t.insertBefore(l, s);
    }
    return [
      // first
      r ? r.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, ct = "transition", Ut = "animation", Ft = /* @__PURE__ */ Symbol("_vtc"), Fo = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: !0
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
}, Ul = /* @__PURE__ */ ue(
  {},
  jr,
  Fo
), vt = (e, t = []) => {
  U(e) ? e.forEach((s) => s(...t)) : e && e(...t);
}, li = (e) => e ? U(e) ? e.some((t) => t.length > 1) : e.length > 1 : !1;
function Bl(e) {
  const t = {};
  for (const m in e)
    m in Fo || (t[m] = e[m]);
  if (e.css === !1)
    return t;
  const {
    name: s = "v",
    type: i,
    duration: n,
    enterFromClass: o = `${s}-enter-from`,
    enterActiveClass: r = `${s}-enter-active`,
    enterToClass: l = `${s}-enter-to`,
    appearFromClass: c = o,
    appearActiveClass: a = r,
    appearToClass: f = l,
    leaveFromClass: d = `${s}-leave-from`,
    leaveActiveClass: _ = `${s}-leave-active`,
    leaveToClass: E = `${s}-leave-to`
  } = e, j = Kl(n), F = j && j[0], Y = j && j[1], {
    onBeforeEnter: R,
    onEnter: P,
    onEnterCancelled: T,
    onLeave: b,
    onLeaveCancelled: k,
    onBeforeAppear: S = R,
    onAppear: v = P,
    onAppearCancelled: B = T
  } = t, N = (m, ee, ge, Xe) => {
    m._enterCancelled = Xe, at(m, ee ? f : l), at(m, ee ? a : r), ge && ge();
  }, G = (m, ee) => {
    m._isLeaving = !1, at(m, d), at(m, E), at(m, _), ee && ee();
  }, Q = (m) => (ee, ge) => {
    const Xe = m ? v : P, fe = () => N(ee, m, ge);
    vt(Xe, [ee, fe]), ci(() => {
      at(ee, m ? c : o), He(ee, m ? f : l), li(Xe) || ai(ee, i, F, fe);
    });
  };
  return ue(t, {
    onBeforeEnter(m) {
      vt(R, [m]), He(m, o), He(m, r);
    },
    onBeforeAppear(m) {
      vt(S, [m]), He(m, c), He(m, a);
    },
    onEnter: Q(!1),
    onAppear: Q(!0),
    onLeave(m, ee) {
      m._isLeaving = !0;
      const ge = () => G(m, ee);
      He(m, d), m._enterCancelled ? (He(m, _), gn(m)) : (gn(m), He(m, _)), ci(() => {
        m._isLeaving && (at(m, d), He(m, E), li(b) || ai(m, i, Y, ge));
      }), vt(b, [m, ge]);
    },
    onEnterCancelled(m) {
      N(m, !1, void 0, !0), vt(T, [m]);
    },
    onAppearCancelled(m) {
      N(m, !0, void 0, !0), vt(B, [m]);
    },
    onLeaveCancelled(m) {
      G(m), vt(k, [m]);
    }
  });
}
function Kl(e) {
  if (e == null)
    return null;
  if (te(e))
    return [Zs(e.enter), Zs(e.leave)];
  {
    const t = Zs(e);
    return [t, t];
  }
}
function Zs(e) {
  return Jo(e);
}
function He(e, t) {
  t.split(/\s+/).forEach((s) => s && e.classList.add(s)), (e[Ft] || (e[Ft] = /* @__PURE__ */ new Set())).add(t);
}
function at(e, t) {
  t.split(/\s+/).forEach((i) => i && e.classList.remove(i));
  const s = e[Ft];
  s && (s.delete(t), s.size || (e[Ft] = void 0));
}
function ci(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let Wl = 0;
function ai(e, t, s, i) {
  const n = e._endId = ++Wl, o = () => {
    n === e._endId && i();
  };
  if (s != null)
    return setTimeout(o, s);
  const { type: r, timeout: l, propCount: c } = No(e, t);
  if (!r)
    return i();
  const a = r + "end";
  let f = 0;
  const d = () => {
    e.removeEventListener(a, _), o();
  }, _ = (E) => {
    E.target === e && ++f >= c && d();
  };
  setTimeout(() => {
    f < c && d();
  }, l + 1), e.addEventListener(a, _);
}
function No(e, t) {
  const s = window.getComputedStyle(e), i = (j) => (s[j] || "").split(", "), n = i(`${ct}Delay`), o = i(`${ct}Duration`), r = ui(n, o), l = i(`${Ut}Delay`), c = i(`${Ut}Duration`), a = ui(l, c);
  let f = null, d = 0, _ = 0;
  t === ct ? r > 0 && (f = ct, d = r, _ = o.length) : t === Ut ? a > 0 && (f = Ut, d = a, _ = c.length) : (d = Math.max(r, a), f = d > 0 ? r > a ? ct : Ut : null, _ = f ? f === ct ? o.length : c.length : 0);
  const E = f === ct && /\b(?:transform|all)(?:,|$)/.test(
    i(`${ct}Property`).toString()
  );
  return {
    type: f,
    timeout: d,
    propCount: _,
    hasTransform: E
  };
}
function ui(e, t) {
  for (; e.length < t.length; )
    e = e.concat(e);
  return Math.max(...t.map((s, i) => fi(s) + fi(e[i])));
}
function fi(e) {
  return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function gn(e) {
  return (e ? e.ownerDocument : document).body.offsetHeight;
}
function ql(e, t, s) {
  const i = e[Ft];
  i && (t = (t ? [t, ...i] : [...i]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const di = /* @__PURE__ */ Symbol("_vod"), Gl = /* @__PURE__ */ Symbol("_vsh"), Jl = /* @__PURE__ */ Symbol(""), Yl = /(?:^|;)\s*display\s*:/;
function zl(e, t, s) {
  const i = e.style, n = ce(s);
  let o = !1;
  if (s && !n) {
    if (t)
      if (ce(t))
        for (const r of t.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          s[l] == null && Kt(i, l, "");
        }
      else
        for (const r in t)
          s[r] == null && Kt(i, r, "");
    for (const r in s) {
      r === "display" && (o = !0);
      const l = s[r];
      l != null ? Zl(
        e,
        r,
        !ce(t) && t ? t[r] : void 0,
        l
      ) || Kt(i, r, l) : Kt(i, r, "");
    }
  } else if (n) {
    if (t !== s) {
      const r = i[Jl];
      r && (s += ";" + r), i.cssText = s, o = Yl.test(s);
    }
  } else t && e.removeAttribute("style");
  di in e && (e[di] = o ? i.display : "", e[Gl] && (i.display = "none"));
}
const pi = /\s*!important$/;
function Kt(e, t, s) {
  if (U(s))
    s.forEach((i) => Kt(e, t, i));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const i = Xl(e, t);
    pi.test(s) ? e.setProperty(
      xt(i),
      s.replace(pi, ""),
      "important"
    ) : e[i] = s;
  }
}
const hi = ["Webkit", "Moz", "ms"], Qs = {};
function Xl(e, t) {
  const s = Qs[t];
  if (s)
    return s;
  let i = ke(t);
  if (i !== "filter" && i in e)
    return Qs[t] = i;
  i = Mi(i);
  for (let n = 0; n < hi.length; n++) {
    const o = hi[n] + i;
    if (o in e)
      return Qs[t] = o;
  }
  return t;
}
function Zl(e, t, s, i) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && ce(i) && s === i;
}
const gi = "http://www.w3.org/1999/xlink";
function mi(e, t, s, i, n, o = er(t)) {
  i && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(gi, t.slice(6, t.length)) : e.setAttributeNS(gi, t, s) : s == null || o && !Ri(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : Ie(s) ? String(s) : s
  );
}
function _i(e, t, s, i, n) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? Lo(s) : s);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const l = o === "OPTION" ? e.getAttribute("value") || "" : e.value, c = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (l !== c || !("_value" in e)) && (e.value = c), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let r = !1;
  if (s === "" || s == null) {
    const l = typeof e[t];
    l === "boolean" ? s = Ri(s) : s == null && l === "string" ? (s = "", r = !0) : l === "number" && (s = 0, r = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  r && e.removeAttribute(n || t);
}
function $t(e, t, s, i) {
  e.addEventListener(t, s, i);
}
function Ql(e, t, s, i) {
  e.removeEventListener(t, s, i);
}
const vi = /* @__PURE__ */ Symbol("_vei");
function ec(e, t, s, i, n = null) {
  const o = e[vi] || (e[vi] = {}), r = o[t];
  if (i && r)
    r.value = i;
  else {
    const [l, c] = tc(t);
    if (i) {
      const a = o[t] = ic(
        i,
        n
      );
      $t(e, l, a, c);
    } else r && (Ql(e, l, r, c), o[t] = void 0);
  }
}
const bi = /(?:Once|Passive|Capture)$/;
function tc(e) {
  let t;
  if (bi.test(e)) {
    t = {};
    let i;
    for (; i = e.match(bi); )
      e = e.slice(0, e.length - i[0].length), t[i[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : xt(e.slice(2)), t];
}
let en = 0;
const sc = /* @__PURE__ */ Promise.resolve(), nc = () => en || (sc.then(() => en = 0), en = Date.now());
function ic(e, t) {
  const s = (i) => {
    if (!i._vts)
      i._vts = Date.now();
    else if (i._vts <= s.attached)
      return;
    const n = s.value;
    if (U(n)) {
      const o = i.stopImmediatePropagation;
      i.stopImmediatePropagation = () => {
        o.call(i), i._stopped = !0;
      };
      const r = n.slice(), l = [i];
      for (let c = 0; c < r.length && !i._stopped; c++) {
        const a = r[c];
        a && Pe(
          a,
          t,
          5,
          l
        );
      }
    } else
      Pe(
        n,
        t,
        5,
        [i]
      );
  };
  return s.value = e, s.attached = nc(), s;
}
const yi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, oc = (e, t, s, i, n, o) => {
  const r = n === "svg";
  t === "class" ? ql(e, i, r) : t === "style" ? zl(e, s, i) : ks(t) ? Ms(t) || ec(e, t, s, i, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : rc(e, t, i, r)) ? (_i(e, t, i), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && mi(e, t, i, r, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (lc(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !ce(i))) ? _i(e, ke(t), i, o, t) : (t === "true-value" ? e._trueValue = i : t === "false-value" && (e._falseValue = i), mi(e, t, i, r));
};
function rc(e, t, s, i) {
  if (i)
    return !!(t === "innerHTML" || t === "textContent" || t in e && yi(t) && q(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const n = e.tagName;
    if (n === "IMG" || n === "VIDEO" || n === "CANVAS" || n === "SOURCE")
      return !1;
  }
  return yi(t) && ce(s) ? !1 : t in e;
}
function lc(e, t) {
  const s = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!s)
    return !1;
  const i = ke(t);
  return Array.isArray(s) ? s.some((n) => ke(n) === i) : Object.keys(s).some((n) => ke(n) === i);
}
const Do = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ Symbol("_moveCb"), wi = /* @__PURE__ */ Symbol("_enterCb"), cc = (e) => (delete e.props.mode, e), ac = /* @__PURE__ */ cc({
  name: "TransitionGroup",
  props: /* @__PURE__ */ ue({}, Ul, {
    tag: String,
    moveClass: String
  }),
  setup(e, { slots: t }) {
    const s = Mo(), i = Hr();
    let n, o;
    return ao(() => {
      if (!n.length)
        return;
      const r = e.moveClass || `${e.name || "v"}-move`;
      if (!hc(
        n[0].el,
        s.vnode.el,
        r
      )) {
        n = [];
        return;
      }
      n.forEach(fc), n.forEach(dc);
      const l = n.filter(pc);
      gn(s.vnode.el), l.forEach((c) => {
        const a = c.el, f = a.style;
        He(a, r), f.transform = f.webkitTransform = f.transitionDuration = "";
        const d = a[Ps] = (_) => {
          _ && _.target !== a || (!_ || _.propertyName.endsWith("transform")) && (a.removeEventListener("transitionend", d), a[Ps] = null, at(a, r));
        };
        a.addEventListener("transitionend", d);
      }), n = [];
    }), () => {
      const r = /* @__PURE__ */ z(e), l = Bl(r);
      let c = r.tag || X;
      if (n = [], o)
        for (let a = 0; a < o.length; a++) {
          const f = o[a];
          f.el && f.el instanceof Element && (n.push(f), ss(
            f,
            cn(
              f,
              l,
              i,
              s
            )
          ), Do.set(f, Ho(f.el)));
        }
      o = t.default ? oo(t.default()) : [];
      for (let a = 0; a < o.length; a++) {
        const f = o[a];
        f.key != null && ss(
          f,
          cn(f, l, i, s)
        );
      }
      return he(c, null, o);
    };
  }
}), uc = ac;
function fc(e) {
  const t = e.el;
  t[Ps] && t[Ps](), t[wi] && t[wi]();
}
function dc(e) {
  Vo.set(e, Ho(e.el));
}
function pc(e) {
  const t = Do.get(e), s = Vo.get(e), i = t.left - s.left, n = t.top - s.top;
  if (i || n) {
    const o = e.el, r = o.style, l = o.getBoundingClientRect();
    let c = 1, a = 1;
    return o.offsetWidth && (c = l.width / o.offsetWidth), o.offsetHeight && (a = l.height / o.offsetHeight), (!Number.isFinite(c) || c === 0) && (c = 1), (!Number.isFinite(a) || a === 0) && (a = 1), Math.abs(c - 1) < 0.01 && (c = 1), Math.abs(a - 1) < 0.01 && (a = 1), r.transform = r.webkitTransform = `translate(${i / c}px,${n / a}px)`, r.transitionDuration = "0s", e;
  }
}
function Ho(e) {
  const t = e.getBoundingClientRect();
  return {
    left: t.left,
    top: t.top
  };
}
function hc(e, t, s) {
  const i = e.cloneNode(), n = e[Ft];
  n && n.forEach((l) => {
    l.split(/\s+/).forEach((c) => c && i.classList.remove(c));
  }), s.split(/\s+/).forEach((l) => l && i.classList.add(l)), i.style.display = "none";
  const o = t.nodeType === 1 ? t : t.parentNode;
  o.appendChild(i);
  const { hasTransform: r } = No(i);
  return o.removeChild(i), r;
}
const Ci = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return U(t) ? (s) => ws(t, s) : t;
};
function gc(e) {
  e.target.composing = !0;
}
function xi(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const tn = /* @__PURE__ */ Symbol("_assign");
function Ei(e, t, s) {
  return t && (e = e.trim()), s && (e = yn(e)), e;
}
const Ke = {
  created(e, { modifiers: { lazy: t, trim: s, number: i } }, n) {
    e[tn] = Ci(n);
    const o = i || n.props && n.props.type === "number";
    $t(e, t ? "change" : "input", (r) => {
      r.target.composing || e[tn](Ei(e.value, s, o));
    }), (s || o) && $t(e, "change", () => {
      e.value = Ei(e.value, s, o);
    }), t || ($t(e, "compositionstart", gc), $t(e, "compositionend", xi), $t(e, "change", xi));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: i, trim: n, number: o } }, r) {
    if (e[tn] = Ci(r), e.composing) return;
    const l = (o || e.type === "number") && !/^0\d/.test(e.value) ? yn(e.value) : e.value, c = t ?? "";
    if (l === c)
      return;
    const a = e.getRootNode();
    (a instanceof Document || a instanceof ShadowRoot) && a.activeElement === e && e.type !== "range" && (i && t === s || n && e.value.trim() === c) || (e.value = c);
  }
}, mc = ["ctrl", "shift", "alt", "meta"], _c = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => mc.some((s) => e[`${s}Key`] && !t.includes(s))
}, mn = (e, t) => {
  if (!e) return e;
  const s = e._withMods || (e._withMods = {}), i = t.join(".");
  return s[i] || (s[i] = ((n, ...o) => {
    for (let r = 0; r < t.length; r++) {
      const l = _c[t[r]];
      if (l && l(n, t)) return;
    }
    return e(n, ...o);
  }));
}, vc = /* @__PURE__ */ ue({ patchProp: oc }, jl);
let Si;
function bc() {
  return Si || (Si = yl(vc));
}
const Rn = ((...e) => {
  const t = bc().createApp(...e), { mount: s } = t;
  return t.mount = (i) => {
    const n = wc(i);
    if (!n) return;
    const o = t._component;
    !q(o) && !o.render && !o.template && (o.template = n.innerHTML), n.nodeType === 1 && (n.textContent = "");
    const r = s(n, !1, yc(n));
    return n instanceof Element && (n.removeAttribute("v-cloak"), n.setAttribute("data-v-app", "")), r;
  }, t;
});
function yc(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function wc(e) {
  return ce(e) ? document.querySelector(e) : e;
}
const Cc = "/moton_prompt_enhancer/api";
function as(e) {
  async function t(s, i, n = null) {
    const o = { method: s };
    n && (o.headers = { "Content-Type": "application/json" }, o.body = JSON.stringify(n));
    const r = await e.fetchApi(`${Cc}${i}`, o);
    if (!r.ok)
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    const l = await r.json();
    if (!l.success)
      throw new Error(l.error || "API request failed");
    return l.data;
  }
  return {
    get: (s) => t("GET", s),
    post: (s, i) => t("POST", s, i),
    put: (s, i) => t("PUT", s, i),
    del: (s) => t("DELETE", s)
  };
}
let Ti = !1;
function vs() {
  return window.__promptcraft_i18n;
}
function us() {
  return !vs() && !Ti && (Ti = !0, console.warn("[PromptCraft] i18n not initialized yet, using fallback until ready")), {
    t: (e, t) => {
      const s = vs();
      return s ? s.t(e, t) : e;
    },
    getLang: () => {
      const e = vs();
      return e ? e.getLang() : "zh";
    },
    setLang: (e) => {
      const t = vs();
      t && t.setLang(e);
    }
  };
}
const pt = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [i, n] of t)
    s[i] = n;
  return s;
}, xc = {
  key: 0,
  class: "pc-dialog-header"
}, Ec = { class: "pc-dialog-title" }, Sc = { class: "pc-dialog-body" }, Tc = {
  key: 1,
  class: "pc-dialog-footer"
}, $c = {
  __name: "BaseDialog",
  props: {
    title: { type: String, default: "" },
    width: { type: String, default: "600px" },
    height: { type: String, default: "auto" },
    showClose: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = t;
    function i(o) {
      o.target === o.currentTarget && s("close");
    }
    function n(o) {
      o.key === "Escape" && s("close");
    }
    return dt(() => {
      document.addEventListener("keydown", n);
    }), ls(() => {
      document.removeEventListener("keydown", n);
    }), (o, r) => (D(), W("div", {
      class: "pc-dialog-backdrop",
      onClick: i
    }, [
      g("div", {
        class: "pc-dialog",
        style: Ls({ maxWidth: e.width, maxHeight: e.height })
      }, [
        e.title || e.showClose ? (D(), W("div", xc, [
          g("h3", Ec, I(e.title), 1),
          e.showClose ? (D(), W("button", {
            key: 0,
            class: "pc-dialog-close",
            onClick: r[0] || (r[0] = (l) => s("close"))
          }, "×")) : Rt("", !0)
        ])) : Rt("", !0),
        g("div", Sc, [
          Gn(o.$slots, "default", {}, void 0)
        ]),
        o.$slots.footer ? (D(), W("div", Tc, [
          Gn(o.$slots, "footer", {}, void 0)
        ])) : Rt("", !0)
      ], 4)
    ]));
  }
}, fs = /* @__PURE__ */ pt($c, [["__scopeId", "data-v-6be679d4"]]), Ac = {
  key: 0,
  class: "pc-toggle-label"
}, Oc = {
  __name: "BaseToggle",
  props: {
    modelValue: { type: Boolean, default: !1 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const s = e, i = t;
    function n() {
      s.disabled || i("update:modelValue", !s.modelValue);
    }
    return (o, r) => (D(), W("label", {
      class: Ce(["pc-toggle-wrap", { "pc-toggle-disabled": e.disabled }]),
      onClick: mn(n, ["prevent"])
    }, [
      e.label ? (D(), W("span", Ac, I(e.label), 1)) : Rt("", !0),
      g("span", {
        class: Ce(["pc-toggle", { "pc-toggle-on": e.modelValue }])
      }, [...r[0] || (r[0] = [
        g("span", { class: "pc-toggle-thumb" }, null, -1)
      ])], 2)
    ], 2));
  }
}, Xt = /* @__PURE__ */ pt(Oc, [["__scopeId", "data-v-02b4ca77"]]), Pc = { class: "lsc-cat-bar" }, kc = { class: "lsc-cat-item" }, Mc = { class: "lsc-cat-label" }, Ic = ["value"], Rc = ["value"], Lc = { class: "lsc-cat-item" }, Fc = { class: "lsc-cat-label" }, Nc = ["value"], Dc = ["value"], Vc = { class: "lsc-cat-item" }, Hc = { class: "lsc-cat-label" }, jc = ["value"], Uc = ["value"], Bc = { class: "lsc-cat-item" }, Kc = ["value"], Wc = ["value"], qc = { class: "lsc-body" }, Gc = { class: "lsc-sidebar" }, Jc = { class: "lsc-service-list" }, Yc = ["onClick"], zc = { class: "lsc-svc-card-name" }, Xc = { class: "lsc-svc-card-url" }, Zc = { class: "lsc-svc-card-badges" }, Qc = { class: "lsc-detail" }, ea = {
  key: 0,
  class: "lsc-detail-form"
}, ta = { class: "lsc-field" }, sa = { class: "lsc-field" }, na = { class: "lsc-field" }, ia = ["placeholder"], oa = { class: "lsc-field" }, ra = { class: "lsc-field-row" }, la = { class: "lsc-field lsc-field-half" }, ca = { class: "lsc-field lsc-field-half" }, aa = { class: "lsc-field-row" }, ua = { class: "lsc-field lsc-field-half" }, fa = { class: "lsc-field lsc-field-half" }, da = { class: "lsc-field" }, pa = ["placeholder"], ha = { class: "lsc-field-hint" }, ga = { class: "lsc-field" }, ma = { class: "lsc-field-hint lsc-field-hint-warning" }, _a = { class: "lsc-field-desc" }, va = { class: "lsc-actions" }, ba = {
  key: 1,
  class: "lsc-detail-placeholder"
}, ya = {
  __name: "ServiceConfig",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, i = t, { t: n } = us(), o = as(s.comfyApi), r = /* @__PURE__ */ Ee([]), l = /* @__PURE__ */ Ee({}), c = /* @__PURE__ */ Ee(null), a = /* @__PURE__ */ Ye({
      name: "",
      api_url: "",
      api_key: "",
      model: "",
      temperature: 0.7,
      max_tokens: 2e3,
      disable_thinking: !0,
      filter_thinking_output: !0,
      aggressive_thinking_control: !1,
      custom_thinking_params: ""
    }), f = /* @__PURE__ */ Ee(!1), d = /* @__PURE__ */ Ye({ message: "", isError: !1 }), _ = /* @__PURE__ */ Ee(!1);
    async function E() {
      _.value = !0;
      try {
        const S = await o.get("/services");
        r.value = S.services, l.value = S.current;
      } catch (S) {
        console.error("[PromptCraft] Load services failed:", S), d.message = n("service_config.status.load_config_failed", { error: S.message }), d.isError = !0;
      } finally {
        _.value = !1;
      }
    }
    async function j(S) {
      c.value = S, f.value = !1;
      const v = r.value.find((B) => B.id === S);
      v && Object.assign(a, {
        name: v.name || "",
        api_url: v.api_url || "",
        api_key: "",
        model: v.model || "",
        temperature: v.temperature ?? 0.7,
        max_tokens: v.max_tokens ?? 2e3,
        disable_thinking: v.disable_thinking !== !1,
        filter_thinking_output: v.filter_thinking_output !== !1,
        aggressive_thinking_control: v.aggressive_thinking_control === !0,
        custom_thinking_params: v.custom_thinking_params ? JSON.stringify(v.custom_thinking_params, null, 2) : ""
      });
    }
    async function F() {
      try {
        const S = await o.post("/services", { name: n("settings.new_service") });
        await E(), j(S.id);
      } catch (S) {
        console.error("[PromptCraft] Add service failed:", S), d.message = n("service_config.status.add_failed", { error: S.message }), d.isError = !0;
      }
    }
    async function Y() {
      if (!c.value) return;
      const S = {};
      for (const B of [
        "name",
        "api_url",
        "model",
        "temperature",
        "max_tokens",
        "disable_thinking",
        "filter_thinking_output",
        "aggressive_thinking_control"
      ])
        S[B] = a[B];
      f.value && (S.api_key = a.api_key);
      const v = R();
      if (!v.ok) {
        d.message = n("service_config.custom_thinking_params_invalid"), d.isError = !0;
        return;
      }
      v.value !== void 0 && (S.custom_thinking_params = v.value);
      try {
        await o.put(`/services/${c.value}`, S), d.message = n("service_config.status.saved"), d.isError = !1, await E();
      } catch (B) {
        d.message = n("service_config.status.save_failed", { error: B.message }), d.isError = !0;
      }
    }
    function R() {
      const S = a.custom_thinking_params;
      if (!S || !S.trim()) return { ok: !0, value: void 0 };
      try {
        return { ok: !0, value: JSON.parse(S) };
      } catch (v) {
        return { ok: !1, error: v };
      }
    }
    async function P() {
      if (c.value && confirm(n("service_config.confirm_delete")))
        try {
          await o.del(`/services/${c.value}`), c.value = null, await E();
        } catch {
          d.message = n("service_config.status.delete_failed"), d.isError = !0;
        }
    }
    async function T() {
      if (c.value) {
        d.message = n("service_config.testing"), d.isError = !1;
        try {
          const S = {};
          if (f.value) {
            S.config = { ...a };
            const B = R();
            if (!B.ok) {
              d.message = n("service_config.custom_thinking_params_invalid"), d.isError = !0;
              return;
            }
            if (B.value !== void 0 ? S.config.custom_thinking_params = B.value : delete S.config.custom_thinking_params, !S.config.api_url) {
              d.message = n("service_config.fill_endpoint"), d.isError = !0;
              return;
            }
          }
          const v = await o.post(`/services/${c.value}/test`, S);
          d.message = n("service_config.connection_success", { name: (v == null ? void 0 : v.message) || "" }), d.isError = !1;
        } catch (S) {
          d.message = n("service_config.connection_failed", { name: S.message }), d.isError = !0;
        }
      }
    }
    async function b(S, v) {
      try {
        await o.put("/services/current", { category: S, service_id: v, model: "" }), l.value[S] = { service_id: v };
      } catch (B) {
        console.error("[PromptCraft] Update category failed:", B), d.message = n("service_config.status.save_failed", { error: B.message }), d.isError = !0;
      }
    }
    function k(S) {
      var B, N, G, Q;
      const v = [];
      return ((B = l.value.enhance_basic) == null ? void 0 : B.service_id) === S.id && v.push({ text: n("settings.basic_enhance"), class: "lsc-badge-amber" }), ((N = l.value.enhance_detail) == null ? void 0 : N.service_id) === S.id && v.push({ text: n("settings.detail_enhance"), class: "lsc-badge-amber" }), ((G = l.value.enhance_normal) == null ? void 0 : G.service_id) === S.id && v.push({ text: n("settings.normal_enhance"), class: "lsc-badge-amber" }), ((Q = l.value.agent) == null ? void 0 : Q.service_id) === S.id && v.push({ text: "Agent", class: "lsc-badge-copper" }), v;
    }
    return dt(E), (S, v) => (D(), ft(fs, {
      title: L(n)("service_config.title"),
      width: "860px",
      onClose: v[15] || (v[15] = (B) => i("close"))
    }, {
      default: rt(() => {
        var B, N, G, Q;
        return [
          g("div", Pc, [
            g("div", kc, [
              g("span", Mc, I(L(n)("settings.basic_enhance")), 1),
              g("select", {
                class: "lsc-cat-select",
                value: ((B = l.value.enhance_basic) == null ? void 0 : B.service_id) || "",
                onChange: v[0] || (v[0] = (m) => b("enhance_basic", m.target.value))
              }, [
                (D(!0), W(X, null, Te(r.value, (m) => (D(), W("option", {
                  key: m.id,
                  value: m.id
                }, I(m.name), 9, Rc))), 128))
              ], 40, Ic)
            ]),
            g("div", Lc, [
              g("span", Fc, I(L(n)("settings.detail_enhance")), 1),
              g("select", {
                class: "lsc-cat-select",
                value: ((N = l.value.enhance_detail) == null ? void 0 : N.service_id) || "",
                onChange: v[1] || (v[1] = (m) => b("enhance_detail", m.target.value))
              }, [
                (D(!0), W(X, null, Te(r.value, (m) => (D(), W("option", {
                  key: m.id,
                  value: m.id
                }, I(m.name), 9, Dc))), 128))
              ], 40, Nc)
            ]),
            g("div", Vc, [
              g("span", Hc, I(L(n)("settings.normal_enhance")), 1),
              g("select", {
                class: "lsc-cat-select",
                value: ((G = l.value.enhance_normal) == null ? void 0 : G.service_id) || "",
                onChange: v[2] || (v[2] = (m) => b("enhance_normal", m.target.value))
              }, [
                (D(!0), W(X, null, Te(r.value, (m) => (D(), W("option", {
                  key: m.id,
                  value: m.id
                }, I(m.name), 9, Uc))), 128))
              ], 40, jc)
            ]),
            g("div", Bc, [
              v[16] || (v[16] = g("span", { class: "lsc-cat-label" }, "AI Agent", -1)),
              g("select", {
                class: "lsc-cat-select",
                value: ((Q = l.value.agent) == null ? void 0 : Q.service_id) || "",
                onChange: v[3] || (v[3] = (m) => b("agent", m.target.value))
              }, [
                (D(!0), W(X, null, Te(r.value, (m) => (D(), W("option", {
                  key: m.id,
                  value: m.id
                }, I(m.name), 9, Wc))), 128))
              ], 40, Kc)
            ])
          ]),
          g("div", qc, [
            g("div", Gc, [
              g("div", Jc, [
                (D(!0), W(X, null, Te(r.value, (m) => (D(), W("div", {
                  key: m.id,
                  class: Ce(["lsc-svc-card", { "lsc-selected": m.id === c.value }]),
                  onClick: (ee) => j(m.id)
                }, [
                  g("div", zc, I(m.name), 1),
                  g("div", Xc, I(m.api_url || L(n)("settings.not_configured")), 1),
                  g("div", Zc, [
                    (D(!0), W(X, null, Te(k(m), (ee) => (D(), W("span", {
                      key: ee.text,
                      class: Ce(["lsc-badge", ee.class])
                    }, I(ee.text), 3))), 128))
                  ])
                ], 10, Yc))), 128))
              ]),
              g("button", {
                class: "lsc-add-btn",
                onClick: F
              }, " + " + I(L(n)("settings.add_service")), 1)
            ]),
            g("div", Qc, [
              c.value ? (D(), W("div", ea, [
                g("div", ta, [
                  g("label", null, I(L(n)("service_config.service_name")), 1),
                  Ue(g("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": v[4] || (v[4] = (m) => a.name = m)
                  }, null, 512), [
                    [Ke, a.name]
                  ])
                ]),
                g("div", sa, [
                  g("label", null, I(L(n)("service_config.api_endpoint")), 1),
                  Ue(g("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": v[5] || (v[5] = (m) => a.api_url = m),
                    placeholder: "https://api.example.com/v1/chat/completions"
                  }, null, 512), [
                    [Ke, a.api_url]
                  ])
                ]),
                g("div", na, [
                  v[17] || (v[17] = g("label", null, "API Key", -1)),
                  Ue(g("input", {
                    class: "lsc-input",
                    type: "password",
                    "onUpdate:modelValue": v[6] || (v[6] = (m) => a.api_key = m),
                    onInput: v[7] || (v[7] = (m) => f.value = !0),
                    placeholder: L(n)("service_config.api_key_placeholder")
                  }, null, 40, ia), [
                    [Ke, a.api_key]
                  ])
                ]),
                g("div", oa, [
                  g("label", null, I(L(n)("service_config.model_name")), 1),
                  Ue(g("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": v[8] || (v[8] = (m) => a.model = m),
                    placeholder: "gpt-4o-mini / deepseek-chat"
                  }, null, 512), [
                    [Ke, a.model]
                  ])
                ]),
                g("div", ra, [
                  g("div", la, [
                    v[18] || (v[18] = g("label", null, "Temperature", -1)),
                    Ue(g("input", {
                      class: "lsc-input",
                      type: "number",
                      step: "0.05",
                      min: "0",
                      max: "2",
                      "onUpdate:modelValue": v[9] || (v[9] = (m) => a.temperature = m)
                    }, null, 512), [
                      [
                        Ke,
                        a.temperature,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  g("div", ca, [
                    v[19] || (v[19] = g("label", null, "Max Tokens", -1)),
                    Ue(g("input", {
                      class: "lsc-input",
                      type: "number",
                      step: "50",
                      min: "50",
                      max: "4000",
                      "onUpdate:modelValue": v[10] || (v[10] = (m) => a.max_tokens = m)
                    }, null, 512), [
                      [
                        Ke,
                        a.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                g("div", aa, [
                  g("div", ua, [
                    he(Xt, {
                      modelValue: a.disable_thinking,
                      "onUpdate:modelValue": v[11] || (v[11] = (m) => a.disable_thinking = m),
                      label: L(n)("service_config.disable_thinking")
                    }, null, 8, ["modelValue", "label"])
                  ]),
                  g("div", fa, [
                    he(Xt, {
                      modelValue: a.filter_thinking_output,
                      "onUpdate:modelValue": v[12] || (v[12] = (m) => a.filter_thinking_output = m),
                      label: L(n)("service_config.filter_thinking")
                    }, null, 8, ["modelValue", "label"])
                  ])
                ]),
                g("div", da, [
                  g("label", null, I(L(n)("service_config.custom_thinking_params")), 1),
                  Ue(g("textarea", {
                    class: "lsc-textarea",
                    "onUpdate:modelValue": v[13] || (v[13] = (m) => a.custom_thinking_params = m),
                    placeholder: L(n)("service_config.custom_thinking_params_placeholder")
                  }, null, 8, pa), [
                    [Ke, a.custom_thinking_params]
                  ]),
                  g("div", ha, I(L(n)("service_config.custom_thinking_params_hint")), 1)
                ]),
                g("div", ga, [
                  he(Xt, {
                    modelValue: a.aggressive_thinking_control,
                    "onUpdate:modelValue": v[14] || (v[14] = (m) => a.aggressive_thinking_control = m),
                    label: L(n)("service_config.aggressive_thinking_control")
                  }, null, 8, ["modelValue", "label"]),
                  g("div", ma, I(L(n)("service_config.aggressive_thinking_control_hint")), 1),
                  g("div", _a, I(L(n)("service_config.aggressive_thinking_control_desc")), 1)
                ]),
                g("div", va, [
                  g("button", {
                    class: "lsc-btn lsc-btn-primary",
                    onClick: T
                  }, " 🧪 " + I(L(n)("service_config.test_connection")), 1),
                  g("button", {
                    class: "lsc-btn lsc-btn-save",
                    onClick: Y
                  }, " 💾 " + I(L(n)("service_config.save")), 1),
                  g("button", {
                    class: "lsc-btn lsc-btn-danger",
                    onClick: P
                  }, I(L(n)("service_config.delete_service")), 1)
                ]),
                d.message ? (D(), W("div", {
                  key: 0,
                  class: Ce(["lsc-status", d.isError ? "lsc-status-error" : "lsc-status-ok"])
                }, I(d.message), 3)) : Rt("", !0)
              ])) : (D(), W("div", ba, I(L(n)("service_config.detail_placeholder")), 1))
            ])
          ])
        ];
      }),
      _: 1
    }, 8, ["title"]));
  }
}, wa = /* @__PURE__ */ pt(ya, [["__scopeId", "data-v-ce584b6c"]]), Ca = { class: "mpe-negative-editor" }, xa = { class: "mpe-desc" }, Ea = { class: "mpe-content" }, Sa = ["placeholder"], Ta = { class: "mpe-footer" }, $a = {
  __name: "NegativePromptEditor",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, i = t, { t: n } = us(), o = as(s.comfyApi), r = /* @__PURE__ */ Ee(""), l = /* @__PURE__ */ Ye({
      message: "",
      isError: !1
    });
    async function c() {
      l.message = n("negative_editor.status.loading"), l.isError = !1;
      try {
        const d = await o.get("/negative_prompt");
        r.value = (d == null ? void 0 : d.content) || "", l.message = n("negative_editor.status.loaded");
      } catch (d) {
        l.message = n("negative_editor.status.load_failed", { error: d.message }), l.isError = !0;
      }
    }
    async function a() {
      l.message = n("negative_editor.status.saving"), l.isError = !1;
      try {
        await o.post("/negative_prompt", { content: r.value }), l.message = n("negative_editor.status.saved");
      } catch (d) {
        l.message = n("negative_editor.status.save_failed", { error: d.message }), l.isError = !0;
      }
    }
    function f(d) {
      (d.ctrlKey || d.metaKey) && d.key === "s" && (d.preventDefault(), a());
    }
    return dt(c), (d, _) => (D(), ft(fs, {
      title: L(n)("negative_editor.title"),
      width: "900px",
      onClose: _[2] || (_[2] = (E) => i("close"))
    }, {
      default: rt(() => [
        g("div", Ca, [
          g("p", xa, I(L(n)("negative_editor.desc")), 1),
          g("div", Ea, [
            Ue(g("textarea", {
              "onUpdate:modelValue": _[0] || (_[0] = (E) => r.value = E),
              class: "mpe-textarea",
              placeholder: L(n)("negative_editor.placeholder"),
              onKeydown: f
            }, null, 40, Sa), [
              [Ke, r.value]
            ])
          ]),
          g("div", Ta, [
            g("span", {
              class: Ce(["mpe-status", { "mpe-status-error": l.isError }])
            }, I(l.message), 3),
            g("button", {
              class: "mpe-btn mpe-btn-save",
              onClick: a
            }, I(L(n)("common.save")), 1),
            g("button", {
              class: "mpe-btn mpe-btn-close",
              onClick: _[1] || (_[1] = (E) => i("close"))
            }, I(L(n)("common.close")), 1)
          ])
        ])
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, Aa = /* @__PURE__ */ pt($a, [["__scopeId", "data-v-58d82baf"]]), Oa = { class: "mpe-rule-section" }, Pa = { class: "mpe-rule-header" }, ka = { class: "mpe-rule-title" }, Ma = ["placeholder"], Ia = { class: "mpe-rule-section" }, Ra = { class: "mpe-rule-header" }, La = { class: "mpe-rule-title" }, Fa = ["placeholder"], Na = { class: "mpe-footer" }, Da = {
  __name: "RuleManager",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, i = t, { t: n } = us(), o = as(s.comfyApi), r = /* @__PURE__ */ Ye({
      sfw_rules: "",
      nsfw_rules: "",
      sfw_enabled: !0,
      nsfw_enabled: !0
    }), l = /* @__PURE__ */ Ye({
      message: "",
      isError: !1
    });
    async function c() {
      l.message = n("rule_manager.status.loading"), l.isError = !1;
      try {
        const d = await o.get("/system_prompt");
        Object.assign(r, {
          sfw_rules: (d == null ? void 0 : d.sfw_rules) || "",
          nsfw_rules: (d == null ? void 0 : d.nsfw_rules) || "",
          sfw_enabled: (d == null ? void 0 : d.sfw_enabled) !== !1,
          nsfw_enabled: (d == null ? void 0 : d.nsfw_enabled) !== !1
        }), l.message = n("rule_manager.status.loaded");
      } catch (d) {
        l.message = n("rule_manager.status.load_failed", { error: d.message }), l.isError = !0;
      }
    }
    async function a() {
      l.message = n("rule_manager.status.saving"), l.isError = !1;
      try {
        await o.post("/system_prompt", { ...r }), l.message = n("rule_manager.status.saved");
      } catch (d) {
        l.message = n("rule_manager.status.save_failed", { error: d.message }), l.isError = !0;
      }
    }
    function f(d) {
      (d.ctrlKey || d.metaKey) && d.key === "s" && (d.preventDefault(), a());
    }
    return dt(c), (d, _) => (D(), ft(fs, {
      title: L(n)("rule_manager.title"),
      width: "900px",
      onClose: _[5] || (_[5] = (E) => i("close"))
    }, {
      default: rt(() => [
        g("div", {
          class: "mpe-rule-manager",
          onKeydown: f
        }, [
          g("div", Oa, [
            g("div", Pa, [
              g("span", ka, I(L(n)("rule_manager.basic")), 1),
              he(Xt, {
                modelValue: r.sfw_enabled,
                "onUpdate:modelValue": _[0] || (_[0] = (E) => r.sfw_enabled = E),
                label: L(n)("rule_manager.enable")
              }, null, 8, ["modelValue", "label"])
            ]),
            Ue(g("textarea", {
              "onUpdate:modelValue": _[1] || (_[1] = (E) => r.sfw_rules = E),
              class: "mpe-textarea",
              placeholder: L(n)("rule_manager.placeholder_basic")
            }, null, 8, Ma), [
              [Ke, r.sfw_rules]
            ])
          ]),
          g("div", Ia, [
            g("div", Ra, [
              g("span", La, I(L(n)("rule_manager.detail")), 1),
              he(Xt, {
                modelValue: r.nsfw_enabled,
                "onUpdate:modelValue": _[2] || (_[2] = (E) => r.nsfw_enabled = E),
                label: L(n)("rule_manager.enable")
              }, null, 8, ["modelValue", "label"])
            ]),
            Ue(g("textarea", {
              "onUpdate:modelValue": _[3] || (_[3] = (E) => r.nsfw_rules = E),
              class: "mpe-textarea",
              placeholder: L(n)("rule_manager.placeholder_detail")
            }, null, 8, Fa), [
              [Ke, r.nsfw_rules]
            ])
          ]),
          g("div", Na, [
            g("span", {
              class: Ce(["mpe-status", { "mpe-status-error": l.isError }])
            }, I(l.message), 3),
            g("button", {
              class: "mpe-btn mpe-btn-save",
              onClick: a
            }, I(L(n)("common.save")), 1),
            g("button", {
              class: "mpe-btn mpe-btn-close",
              onClick: _[4] || (_[4] = (E) => i("close"))
            }, I(L(n)("common.close")), 1)
          ])
        ], 32)
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, Va = /* @__PURE__ */ pt(Da, [["__scopeId", "data-v-28f984db"]]), Ha = { class: "le-desc" }, ja = { class: "le-tabs" }, Ua = { class: "le-status-bar" }, Ba = { class: "le-content" }, Ka = {
  key: 0,
  class: "le-loading"
}, Wa = {
  key: 1,
  class: "le-table"
}, qa = { class: "le-cat-label" }, Ga = { class: "le-cat-options" }, Ja = { class: "le-opt-list" }, Ya = ["value", "onInput"], za = ["value", "onInput"], Xa = { class: "le-sg-label" }, Za = { class: "le-opt-list" }, Qa = ["value", "onInput"], eu = ["value", "onInput"], tu = { class: "le-hint" }, su = {
  __name: "LibraryEditor",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, i = t, { t: n } = us(), o = as(s.comfyApi), r = /* @__PURE__ */ Ee("sfw"), l = /* @__PURE__ */ Ee(null), c = /* @__PURE__ */ Ee({}), a = /* @__PURE__ */ Ye({ message: "", isError: !1 }), f = /* @__PURE__ */ Ee(!1);
    async function d(R) {
      f.value = !0, r.value = R, a.message = n("library_editor.status.loading"), a.isError = !1;
      try {
        const P = await o.get(`/library/${R}`);
        l.value = P, c.value = P.categories || {};
        const T = Object.keys(c.value).length;
        let b = 0;
        Object.values(c.value).forEach((k) => {
          b += (k.options || []).length;
          const S = k.subgroups || {};
          Object.values(S).forEach((v) => {
            b += (v.options || []).length;
          });
        }), a.message = n("library_editor.status.loaded", {
          type: R.toUpperCase(),
          catCount: T,
          optCount: b
        });
      } catch (P) {
        a.message = n("library_editor.status.load_exception", { error: P.message }), a.isError = !0;
      } finally {
        f.value = !1;
      }
    }
    function _() {
      const R = {};
      return Object.entries(c.value).forEach(([P, T]) => {
        const b = [], k = T || {};
        if (k.options && k.options.forEach((S) => {
          S.label && S.en && b.push({ label: S.label, en: S.en });
        }), R[P] = {
          label: k.label || P,
          description: k.description || "",
          options: b
        }, k.subgroups) {
          const S = {};
          Object.entries(k.subgroups).forEach(([v, B]) => {
            const N = [];
            B.options && B.options.forEach((G) => {
              G.label && G.en && N.push({ label: G.label, en: G.en });
            }), S[v] = {
              label: B.label || v,
              options: N
            };
          }), R[P].subgroups = S;
        }
      }), R;
    }
    async function E() {
      try {
        const R = _(), P = { ...l.value, categories: R };
        a.message = n("library_editor.status.saving"), a.isError = !1, await o.post(`/library/${r.value}`, P), a.message = n("library_editor.status.saved", { type: r.value.toUpperCase() }), l.value = P;
        try {
          await o.post(`/library/${r.value}_reload`, {});
        } catch (T) {
          console.warn("[PromptCraft] Library cache reload failed:", T);
        }
      } catch (R) {
        a.message = n("library_editor.status.save_failed", { error: R.message }), a.isError = !0;
      }
    }
    function j(R, P, T, b) {
      var k, S;
      (S = (k = c.value[R]) == null ? void 0 : k.options) != null && S[P] && (c.value[R].options[P][T] = b);
    }
    function F(R, P, T, b, k) {
      var S, v, B, N;
      (N = (B = (v = (S = c.value[R]) == null ? void 0 : S.subgroups) == null ? void 0 : v[P]) == null ? void 0 : B.options) != null && N[T] && (c.value[R].subgroups[P].options[T][b] = k);
    }
    function Y(R) {
      (R.ctrlKey || R.metaKey) && R.key === "s" && (R.preventDefault(), E());
    }
    return dt(() => {
      d("sfw"), document.addEventListener("keydown", Y);
    }), ls(() => {
      document.removeEventListener("keydown", Y);
    }), (R, P) => (D(), ft(fs, {
      title: L(n)("library_editor.title"),
      width: "900px",
      onClose: P[4] || (P[4] = (T) => i("close"))
    }, {
      footer: rt(() => [
        g("span", tu, I(L(n)("library_editor.save_hint")), 1),
        g("button", {
          class: "le-btn le-btn-primary",
          onClick: E
        }, I(L(n)("common.save")), 1),
        g("button", {
          class: "le-btn",
          onClick: P[3] || (P[3] = (T) => i("close"))
        }, I(L(n)("common.close")), 1)
      ]),
      default: rt(() => [
        g("p", Ha, I(L(n)("library_editor.desc")), 1),
        g("div", ja, [
          g("button", {
            class: Ce(["le-tab", { "le-tab-active": r.value === "sfw" }]),
            onClick: P[0] || (P[0] = (T) => d("sfw"))
          }, I(L(n)("library_editor.tab_sfw")), 3),
          g("button", {
            class: Ce(["le-tab", { "le-tab-active": r.value === "nsfw" }]),
            onClick: P[1] || (P[1] = (T) => d("nsfw"))
          }, I(L(n)("library_editor.tab_nsfw")), 3)
        ]),
        g("div", Ua, [
          g("span", {
            class: Ce(["le-status", { "le-status-error": a.isError }])
          }, I(a.message), 3),
          g("button", {
            class: "le-btn",
            onClick: P[2] || (P[2] = (T) => d(r.value))
          }, I(L(n)("library_editor.refresh")), 1)
        ]),
        g("div", Ba, [
          f.value ? (D(), W("div", Ka, I(L(n)("library_editor.status.loading")), 1)) : (D(), W("table", Wa, [
            g("tbody", null, [
              (D(!0), W(X, null, Te(c.value, (T, b) => (D(), W("tr", {
                key: b,
                class: "le-cat-row"
              }, [
                g("td", qa, I(b), 1),
                g("td", Ga, [
                  g("div", Ja, [
                    (D(!0), W(X, null, Te(T.options, (k, S) => (D(), W("div", {
                      key: S,
                      class: "le-opt-item"
                    }, [
                      g("input", {
                        class: "le-input",
                        value: k.label,
                        onInput: (v) => j(b, S, "label", v.target.value),
                        placeholder: "Label"
                      }, null, 40, Ya),
                      g("input", {
                        class: "le-input le-input-en",
                        value: k.en,
                        onInput: (v) => j(b, S, "en", v.target.value),
                        placeholder: "English"
                      }, null, 40, za)
                    ]))), 128))
                  ]),
                  (D(!0), W(X, null, Te(T.subgroups, (k, S) => (D(), W("div", {
                    key: S,
                    class: "le-subgroup"
                  }, [
                    g("div", Xa, "🎲 " + I(k.label || S), 1),
                    g("div", Za, [
                      (D(!0), W(X, null, Te(k.options, (v, B) => (D(), W("div", {
                        key: B,
                        class: "le-opt-item"
                      }, [
                        g("input", {
                          class: "le-input",
                          value: v.label,
                          onInput: (N) => F(b, S, B, "label", N.target.value),
                          placeholder: "Label"
                        }, null, 40, Qa),
                        g("input", {
                          class: "le-input le-input-en",
                          value: v.en,
                          onInput: (N) => F(b, S, B, "en", N.target.value),
                          placeholder: "English"
                        }, null, 40, eu)
                      ]))), 128))
                    ])
                  ]))), 128))
                ])
              ]))), 128))
            ])
          ]))
        ])
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, nu = /* @__PURE__ */ pt(su, [["__scopeId", "data-v-92eb51ec"]]), bs = /* @__PURE__ */ Ee([]), ys = /* @__PURE__ */ new Map();
let iu = 0;
function jo() {
  function e(s, i = "info", n = 3e3) {
    const o = ++iu;
    bs.value.push({ id: o, message: s, type: i });
    const r = setTimeout(() => {
      bs.value = bs.value.filter((l) => l.id !== o), ys.delete(o);
    }, n);
    ys.set(o, r);
  }
  function t() {
    ys.forEach((s) => clearTimeout(s)), ys.clear();
  }
  return {
    toasts: bs,
    clearTimers: t,
    success: (s) => e(s, "success"),
    error: (s) => e(s, "error", 5e3),
    info: (s) => e(s, "info"),
    warning: (s) => e(s, "warning")
  };
}
const ou = { class: "ph-toolbar" }, ru = { class: "ph-hint" }, lu = { class: "ph-controls" }, cu = { class: "ph-limit-label" }, au = ["value"], uu = { value: "0" }, fu = { class: "ph-content" }, du = {
  key: 0,
  class: "ph-loading"
}, pu = {
  key: 1,
  class: "ph-empty"
}, hu = {
  key: 2,
  class: "ph-list"
}, gu = ["onClick"], mu = { class: "ph-entry-content" }, _u = { class: "ph-entry-meta" }, vu = { class: "ph-time" }, bu = { class: "ph-positive" }, yu = {
  key: 0,
  class: "ph-negative"
}, wu = { class: "ph-entry-actions" }, Cu = ["onClick", "title"], xu = ["onClick", "title"], Eu = {
  __name: "PromptHistory",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const s = e, i = t, { t: n } = us(), o = as(s.comfyApi), r = jo(), l = /* @__PURE__ */ Ee([]), c = /* @__PURE__ */ Ee(50), a = /* @__PURE__ */ Ye({ message: "", isError: !1 }), f = /* @__PURE__ */ Ee(!1);
    function d(T) {
      if (T === 0 || T === void 0 || T === null || isNaN(T)) return "--";
      const b = new Date(T * 1e3);
      if (isNaN(b.getTime())) return "--";
      const k = (S) => String(S).padStart(2, "0");
      return `${b.getFullYear()}-${k(b.getMonth() + 1)}-${k(b.getDate())} ${k(b.getHours())}:${k(b.getMinutes())}`;
    }
    function _(T, b) {
      return T ? T.length > b ? T.slice(0, b) + "..." : T : "";
    }
    function E(T) {
      const b = [];
      return T != null && T.llm_enhanced && b.push("LLM"), T != null && T.special && b.push("NSFW"), b;
    }
    async function j() {
      f.value = !0, a.message = n("history.status.loading"), a.isError = !1;
      try {
        const T = await o.get("/prompt_history");
        l.value = T.entries || [], c.value = T.limit ?? 50, l.value.length === 0 ? a.message = n("history.no_record") : a.message = n("history.count", { count: l.value.length });
      } catch (T) {
        a.message = n("history.status.load_exception", { error: T.message }), a.isError = !0;
      } finally {
        f.value = !1;
      }
    }
    async function F(T) {
      try {
        await navigator.clipboard.writeText(T.positive || ""), r.show(n("history.copied_positive"), "success");
      } catch {
        r.show(n("history.copy_failed"), "error");
      }
    }
    async function Y(T) {
      try {
        await o.del(`/prompt_history/${T}`), await j(), r.show(n("history.deleted"), "success");
      } catch {
        r.show(n("history.delete_failed"), "error");
      }
    }
    async function R(T) {
      try {
        await o.put("/prompt_history/limit", { limit: T }), c.value = T, a.message = n("history.limit_set", {
          value: T === 0 ? n("history.limit_none") : T
        }), await j();
      } catch {
        a.message = n("history.limit_update_failed"), a.isError = !0;
      }
    }
    async function P() {
      if (confirm(n("history.confirm_clear")))
        try {
          await o.del("/prompt_history"), await j(), a.message = n("history.cleared"), r.show(n("history.cleared"), "success");
        } catch {
          a.message = n("history.clear_failed"), a.isError = !0;
        }
    }
    return dt(() => {
      j();
    }), (T, b) => (D(), ft(fs, {
      title: L(n)("history.title"),
      width: "900px",
      onClose: b[2] || (b[2] = (k) => i("close"))
    }, {
      footer: rt(() => [
        g("span", {
          class: Ce(["ph-status", { "ph-status-error": a.isError }])
        }, I(a.message), 3),
        g("button", {
          class: "ph-btn",
          onClick: b[1] || (b[1] = (k) => i("close"))
        }, I(L(n)("common.close")), 1)
      ]),
      default: rt(() => [
        g("div", ou, [
          g("span", ru, I(L(n)("history.click_hint")), 1),
          g("div", lu, [
            g("label", cu, [
              At(I(L(n)("history.limit_label")) + " ", 1),
              g("select", {
                class: "ph-limit-select",
                value: c.value,
                onChange: b[0] || (b[0] = (k) => R(parseInt(k.target.value)))
              }, [
                b[3] || (b[3] = g("option", { value: "10" }, "10", -1)),
                b[4] || (b[4] = g("option", { value: "20" }, "20", -1)),
                b[5] || (b[5] = g("option", { value: "50" }, "50", -1)),
                b[6] || (b[6] = g("option", { value: "100" }, "100", -1)),
                g("option", uu, I(L(n)("history.no_limit")), 1)
              ], 40, au)
            ]),
            g("button", {
              class: "ph-btn ph-btn-danger",
              onClick: P
            }, I(L(n)("history.clear_all")), 1)
          ])
        ]),
        g("div", fu, [
          f.value ? (D(), W("div", du, I(L(n)("history.status.loading")), 1)) : l.value.length === 0 ? (D(), W("div", pu, I(L(n)("history.empty")), 1)) : (D(), W("div", hu, [
            (D(!0), W(X, null, Te(l.value, (k, S) => (D(), W("div", {
              key: k.id,
              class: "ph-entry",
              onClick: (v) => F(k)
            }, [
              g("div", mu, [
                g("div", _u, [
                  g("span", vu, I(d(k.timestamp)), 1),
                  (D(!0), W(X, null, Te(E(k.extra), (v) => (D(), W("span", {
                    key: v,
                    class: "ph-tag"
                  }, I(v), 1))), 128))
                ]),
                g("div", bu, I(_(k.positive, 120)), 1),
                k.negative ? (D(), W("div", yu, " Neg: " + I(_(k.negative, 60)), 1)) : Rt("", !0)
              ]),
              g("div", wu, [
                g("button", {
                  class: "ph-btn",
                  onClick: mn((v) => F(k), ["stop"]),
                  title: L(n)("history.copy_positive")
                }, I(L(n)("common.copy")), 9, Cu),
                g("button", {
                  class: "ph-btn ph-btn-icon",
                  onClick: mn((v) => Y(k.id), ["stop"]),
                  title: L(n)("common.delete")
                }, " × ", 8, xu)
              ])
            ], 8, gu))), 128))
          ]))
        ])
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, Su = /* @__PURE__ */ pt(Eu, [["__scopeId", "data-v-b434ebc5"]]), Tu = { class: "toast-container" }, $u = { class: "toast-icon" }, Au = { class: "toast-message" }, Ou = {
  __name: "Toast",
  setup(e) {
    const { toasts: t, clearTimers: s } = jo();
    return ls(() => {
      s();
    }), (i, n) => (D(), W("div", Tu, [
      he(uc, { name: "toast" }, {
        default: rt(() => [
          (D(!0), W(X, null, Te(L(t), (o) => (D(), W("div", {
            key: o.id,
            class: Ce(["toast", `toast-${o.type}`])
          }, [
            g("span", $u, [
              o.type === "success" ? (D(), W(X, { key: 0 }, [
                At("✓")
              ], 64)) : o.type === "error" ? (D(), W(X, { key: 1 }, [
                At("✕")
              ], 64)) : o.type === "warning" ? (D(), W(X, { key: 2 }, [
                At("⚠")
              ], 64)) : (D(), W(X, { key: 3 }, [
                At("ℹ")
              ], 64))
            ]),
            g("span", Au, I(o.message), 1)
          ], 2))), 128))
        ]),
        _: 1
      })
    ]));
  }
}, Pu = /* @__PURE__ */ pt(Ou, [["__scopeId", "data-v-f57fb0b7"]]);
function Nu(e, t, s = {}) {
  const i = Rn(t, s);
  return { vm: i.mount(e), unmount: () => i.unmount() };
}
function ds(e, t) {
  let s = null, i = null;
  return {
    open(n) {
      this.close(), i = document.createElement("div"), i.id = t, document.body.appendChild(i);
      const o = Rn(e, {
        comfyApi: n,
        onClose: () => this.close()
      });
      s = {
        unmount: () => {
          o.unmount(), i && (i.remove(), i = null);
        }
      }, o.mount(i);
    },
    close() {
      s && (s.unmount(), s = null);
    }
  };
}
const ku = ds(wa, "promptcraft-service-config"), Mu = ds(Aa, "promptcraft-negative-editor"), Iu = ds(Va, "promptcraft-rule-manager"), Ru = ds(nu, "promptcraft-library-editor"), Lu = ds(Su, "promptcraft-prompt-history");
let Zt = null;
function Du() {
  if (Zt) return;
  const e = document.createElement("div");
  e.id = "promptcraft-toast", document.body.appendChild(e);
  const t = Rn(Pu);
  Zt = {
    unmount: () => {
      t.unmount(), e.parentNode && e.remove();
    }
  }, t.mount(e);
}
function Vu() {
  Zt && (Zt.unmount(), Zt = null);
}
function Hu(e) {
  ku.open(e);
}
function ju(e) {
  Mu.open(e);
}
function Uu(e) {
  Iu.open(e);
}
function Bu(e) {
  Ru.open(e);
}
function Ku(e) {
  Lu.open(e);
}
export {
  nu as LibraryEditor,
  Aa as NegativePromptEditor,
  Su as PromptHistory,
  Va as RuleManager,
  wa as ServiceConfig,
  Pu as Toast,
  Ru as libraryEditorModal,
  Du as mountToast,
  Nu as mountVueWidget,
  Mu as negativePromptModal,
  Bu as openLibraryEditor,
  ju as openNegativePromptEditor,
  Ku as openPromptHistory,
  Uu as openRuleManager,
  Hu as openServiceConfigModal,
  Lu as promptHistoryModal,
  Iu as ruleManagerModal,
  ku as serviceConfigModal,
  Vu as unmountToast
};
