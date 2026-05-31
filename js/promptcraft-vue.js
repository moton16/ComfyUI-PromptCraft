/**
* @vue/shared v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function st(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const z = process.env.NODE_ENV !== "production" ? Object.freeze({}) : {}, Tt = process.env.NODE_ENV !== "production" ? Object.freeze([]) : [], ce = () => {
}, Zo = () => !1, ln = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), en = (e) => e.startsWith("onUpdate:"), re = Object.assign, Ts = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, gi = Object.prototype.hasOwnProperty, U = (e, t) => gi.call(e, t), A = Array.isArray, mt = (e) => cn(e) === "[object Map]", Qo = (e) => cn(e) === "[object Set]", lo = (e) => cn(e) === "[object Date]", I = (e) => typeof e == "function", Z = (e) => typeof e == "string", De = (e) => typeof e == "symbol", W = (e) => e !== null && typeof e == "object", $s = (e) => (W(e) || I(e)) && I(e.then) && I(e.catch), er = Object.prototype.toString, cn = (e) => er.call(e), As = (e) => cn(e).slice(8, -1), tr = (e) => cn(e) === "[object Object]", Ps = (e) => Z(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Gt = /* @__PURE__ */ st(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), mi = /* @__PURE__ */ st(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
), Un = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, _i = /-\w/g, Oe = Un(
  (e) => e.replace(_i, (t) => t.slice(1).toUpperCase())
), vi = /\B([A-Z])/g, at = Un(
  (e) => e.replace(vi, "-$1").toLowerCase()
), Kn = Un((e) => e.charAt(0).toUpperCase() + e.slice(1)), ht = Un(
  (e) => e ? `on${Kn(e)}` : ""
), Ge = (e, t) => !Object.is(e, t), Vt = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, $n = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Ms = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let co;
const un = () => co || (co = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Bn(e) {
  if (A(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], o = Z(s) ? Ni(s) : Bn(s);
      if (o)
        for (const r in o)
          t[r] = o[r];
    }
    return t;
  } else if (Z(e) || W(e))
    return e;
}
const Ei = /;(?![^(]*\))/g, bi = /:([^]+)/, yi = /\/\*[^]*?\*\//g;
function Ni(e) {
  const t = {};
  return e.replace(yi, "").split(Ei).forEach((n) => {
    if (n) {
      const s = n.split(bi);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function ze(e) {
  let t = "";
  if (Z(e))
    t = e;
  else if (A(e))
    for (let n = 0; n < e.length; n++) {
      const s = ze(e[n]);
      s && (t += s + " ");
    }
  else if (W(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Oi = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", wi = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", xi = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics", Vi = /* @__PURE__ */ st(Oi), Di = /* @__PURE__ */ st(wi), Si = /* @__PURE__ */ st(xi), Ci = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ti = /* @__PURE__ */ st(Ci);
function nr(e) {
  return !!e || e === "";
}
function $i(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let s = 0; n && s < e.length; s++)
    n = Is(e[s], t[s]);
  return n;
}
function Is(e, t) {
  if (e === t) return !0;
  let n = lo(e), s = lo(t);
  if (n || s)
    return n && s ? e.getTime() === t.getTime() : !1;
  if (n = De(e), s = De(t), n || s)
    return e === t;
  if (n = A(e), s = A(t), n || s)
    return n && s ? $i(e, t) : !1;
  if (n = W(e), s = W(t), n || s) {
    if (!n || !s)
      return !1;
    const o = Object.keys(e).length, r = Object.keys(t).length;
    if (o !== r)
      return !1;
    for (const i in e) {
      const l = e.hasOwnProperty(i), u = t.hasOwnProperty(i);
      if (l && !u || !l && u || !Is(e[i], t[i]))
        return !1;
    }
  }
  return String(e) === String(t);
}
const sr = (e) => !!(e && e.__v_isRef === !0), G = (e) => Z(e) ? e : e == null ? "" : A(e) || W(e) && (e.toString === er || !I(e.toString)) ? sr(e) ? G(e.value) : JSON.stringify(e, or, 2) : String(e), or = (e, t) => sr(t) ? or(e, t.value) : mt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, o], r) => (n[ns(s, r) + " =>"] = o, n),
    {}
  )
} : Qo(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => ns(n))
} : De(t) ? ns(t) : W(t) && !A(t) && !tr(t) ? String(t) : t, ns = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    De(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Ae(e, ...t) {
  console.warn(`[Vue warn] ${e}`, ...t);
}
let fe;
class Ai {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && fe && (fe.active ? (this.parent = fe, this.index = (fe.scopes || (fe.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = fe;
      try {
        return fe = this, t();
      } finally {
        fe = n;
      }
    } else process.env.NODE_ENV !== "production" && this._warnOnRun && Ae("cannot run an inactive effect scope.");
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = fe, fe = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (fe === this)
        fe = this.prevScope;
      else {
        let t = fe;
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
      let n, s;
      for (n = 0, s = this.effects.length; n < s; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, s = this.scopes.length; n < s; n++)
          this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const o = this.parent.scopes.pop();
        o && o !== this && (this.parent.scopes[this.index] = o, o.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Pi() {
  return fe;
}
let Y;
const ss = /* @__PURE__ */ new WeakSet();
class rr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, fe && (fe.active ? fe.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, ss.has(this) && (ss.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || lr(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, uo(this), cr(this);
    const t = Y, n = $e;
    Y = this, $e = !0;
    try {
      return this.fn();
    } finally {
      process.env.NODE_ENV !== "production" && Y !== this && Ae(
        "Active effect was not restored correctly - this is likely a Vue internal bug."
      ), ur(this), Y = t, $e = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        js(t);
      this.deps = this.depsTail = void 0, uo(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? ss.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    gs(this) && this.run();
  }
  get dirty() {
    return gs(this);
  }
}
let ir = 0, Jt, Yt;
function lr(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Yt, Yt = e;
    return;
  }
  e.next = Jt, Jt = e;
}
function Rs() {
  ir++;
}
function ks() {
  if (--ir > 0)
    return;
  if (Yt) {
    let t = Yt;
    for (Yt = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Jt; ) {
    let t = Jt;
    for (Jt = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (s) {
          e || (e = s);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function cr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ur(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const o = s.prevDep;
    s.version === -1 ? (s === n && (n = o), js(s), Mi(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = o;
  }
  e.deps = t, e.depsTail = n;
}
function gs(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (ar(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function ar(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === tn) || (e.globalVersion = tn, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !gs(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = Y, s = $e;
  Y = e, $e = !0;
  try {
    cr(e);
    const o = e.fn(e._value);
    (t.version === 0 || Ge(o, e._value)) && (e.flags |= 128, e._value = o, t.version++);
  } catch (o) {
    throw t.version++, o;
  } finally {
    Y = n, $e = s, ur(e), e.flags &= -3;
  }
}
function js(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: o } = e;
  if (s && (s.nextSub = o, e.prevSub = void 0), o && (o.prevSub = s, e.nextSub = void 0), process.env.NODE_ENV !== "production" && n.subsHead === e && (n.subsHead = o), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let r = n.computed.deps; r; r = r.nextDep)
      js(r, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Mi(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let $e = !0;
const fr = [];
function Pe() {
  fr.push($e), $e = !1;
}
function Me() {
  const e = fr.pop();
  $e = e === void 0 ? !0 : e;
}
function uo(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Y;
    Y = void 0;
    try {
      t();
    } finally {
      Y = n;
    }
  }
}
let tn = 0;
class Ii {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Fs {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0, process.env.NODE_ENV !== "production" && (this.subsHead = void 0);
  }
  track(t) {
    if (!Y || !$e || Y === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Y)
      n = this.activeLink = new Ii(Y, this), Y.deps ? (n.prevDep = Y.depsTail, Y.depsTail.nextDep = n, Y.depsTail = n) : Y.deps = Y.depsTail = n, dr(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Y.depsTail, n.nextDep = void 0, Y.depsTail.nextDep = n, Y.depsTail = n, Y.deps === n && (Y.deps = s);
    }
    return process.env.NODE_ENV !== "production" && Y.onTrack && Y.onTrack(
      re(
        {
          effect: Y
        },
        t
      )
    ), n;
  }
  trigger(t) {
    this.version++, tn++, this.notify(t);
  }
  notify(t) {
    Rs();
    try {
      if (process.env.NODE_ENV !== "production")
        for (let n = this.subsHead; n; n = n.nextSub)
          n.sub.onTrigger && !(n.sub.flags & 8) && n.sub.onTrigger(
            re(
              {
                effect: n.sub
              },
              t
            )
          );
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ks();
    }
  }
}
function dr(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        dr(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), process.env.NODE_ENV !== "production" && e.dep.subsHead === void 0 && (e.dep.subsHead = e), e.dep.subs = e;
  }
}
const ms = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ Symbol(
  process.env.NODE_ENV !== "production" ? "Object iterate" : ""
), _s = /* @__PURE__ */ Symbol(
  process.env.NODE_ENV !== "production" ? "Map keys iterate" : ""
), nn = /* @__PURE__ */ Symbol(
  process.env.NODE_ENV !== "production" ? "Array iterate" : ""
);
function le(e, t, n) {
  if ($e && Y) {
    let s = ms.get(e);
    s || ms.set(e, s = /* @__PURE__ */ new Map());
    let o = s.get(n);
    o || (s.set(n, o = new Fs()), o.map = s, o.key = n), process.env.NODE_ENV !== "production" ? o.track({
      target: e,
      type: t,
      key: n
    }) : o.track();
  }
}
function Je(e, t, n, s, o, r) {
  const i = ms.get(e);
  if (!i) {
    tn++;
    return;
  }
  const l = (u) => {
    u && (process.env.NODE_ENV !== "production" ? u.trigger({
      target: e,
      type: t,
      key: n,
      newValue: s,
      oldValue: o,
      oldTarget: r
    }) : u.trigger());
  };
  if (Rs(), t === "clear")
    i.forEach(l);
  else {
    const u = A(e), p = u && Ps(n);
    if (u && n === "length") {
      const d = Number(s);
      i.forEach((a, g) => {
        (g === "length" || g === nn || !De(g) && g >= d) && l(a);
      });
    } else
      switch ((n !== void 0 || i.has(void 0)) && l(i.get(n)), p && l(i.get(nn)), t) {
        case "add":
          u ? p && l(i.get("length")) : (l(i.get(_t)), mt(e) && l(i.get(_s)));
          break;
        case "delete":
          u || (l(i.get(_t)), mt(e) && l(i.get(_s)));
          break;
        case "set":
          mt(e) && l(i.get(_t));
          break;
      }
  }
  ks();
}
function Ot(e) {
  const t = /* @__PURE__ */ k(e);
  return t === e ? t : (le(t, "iterate", nn), /* @__PURE__ */ ve(e) ? t : t.map(Re));
}
function Wn(e) {
  return le(e = /* @__PURE__ */ k(e), "iterate", nn), e;
}
function qe(e, t) {
  return /* @__PURE__ */ Ie(e) ? Mt(/* @__PURE__ */ ut(e) ? Re(t) : t) : Re(t);
}
const Ri = {
  __proto__: null,
  [Symbol.iterator]() {
    return os(this, Symbol.iterator, (e) => qe(this, e));
  },
  concat(...e) {
    return Ot(this).concat(
      ...e.map((t) => A(t) ? Ot(t) : t)
    );
  },
  entries() {
    return os(this, "entries", (e) => (e[1] = qe(this, e[1]), e));
  },
  every(e, t) {
    return Xe(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Xe(
      this,
      "filter",
      e,
      t,
      (n) => n.map((s) => qe(this, s)),
      arguments
    );
  },
  find(e, t) {
    return Xe(
      this,
      "find",
      e,
      t,
      (n) => qe(this, n),
      arguments
    );
  },
  findIndex(e, t) {
    return Xe(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Xe(
      this,
      "findLast",
      e,
      t,
      (n) => qe(this, n),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Xe(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Xe(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return rs(this, "includes", e);
  },
  indexOf(...e) {
    return rs(this, "indexOf", e);
  },
  join(e) {
    return Ot(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return rs(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Xe(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Lt(this, "pop");
  },
  push(...e) {
    return Lt(this, "push", e);
  },
  reduce(e, ...t) {
    return ao(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return ao(this, "reduceRight", e, t);
  },
  shift() {
    return Lt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Xe(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Lt(this, "splice", e);
  },
  toReversed() {
    return Ot(this).toReversed();
  },
  toSorted(e) {
    return Ot(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ot(this).toSpliced(...e);
  },
  unshift(...e) {
    return Lt(this, "unshift", e);
  },
  values() {
    return os(this, "values", (e) => qe(this, e));
  }
};
function os(e, t, n) {
  const s = Wn(e), o = s[t]();
  return s !== e && !/* @__PURE__ */ ve(e) && (o._next = o.next, o.next = () => {
    const r = o._next();
    return r.done || (r.value = n(r.value)), r;
  }), o;
}
const ki = Array.prototype;
function Xe(e, t, n, s, o, r) {
  const i = Wn(e), l = i !== e && !/* @__PURE__ */ ve(e), u = i[t];
  if (u !== ki[t]) {
    const a = u.apply(e, r);
    return l ? Re(a) : a;
  }
  let p = n;
  i !== e && (l ? p = function(a, g) {
    return n.call(this, qe(e, a), g, e);
  } : n.length > 2 && (p = function(a, g) {
    return n.call(this, a, g, e);
  }));
  const d = u.call(i, p, s);
  return l && o ? o(d) : d;
}
function ao(e, t, n, s) {
  const o = Wn(e), r = o !== e && !/* @__PURE__ */ ve(e);
  let i = n, l = !1;
  o !== e && (r ? (l = s.length === 0, i = function(p, d, a) {
    return l && (l = !1, p = qe(e, p)), n.call(this, p, qe(e, d), a, e);
  }) : n.length > 3 && (i = function(p, d, a) {
    return n.call(this, p, d, a, e);
  }));
  const u = o[t](i, ...s);
  return l ? qe(e, u) : u;
}
function rs(e, t, n) {
  const s = /* @__PURE__ */ k(e);
  le(s, "iterate", nn);
  const o = s[t](...n);
  return (o === -1 || o === !1) && /* @__PURE__ */ An(n[0]) ? (n[0] = /* @__PURE__ */ k(n[0]), s[t](...n)) : o;
}
function Lt(e, t, n = []) {
  Pe(), Rs();
  const s = (/* @__PURE__ */ k(e))[t].apply(e, n);
  return ks(), Me(), s;
}
const ji = /* @__PURE__ */ st("__proto__,__v_isRef,__isVue"), pr = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(De)
);
function Fi(e) {
  De(e) || (e = String(e));
  const t = /* @__PURE__ */ k(this);
  return le(t, "has", e), t.hasOwnProperty(e);
}
class hr {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, s) {
    if (n === "__v_skip") return t.__v_skip;
    const o = this._isReadonly, r = this._isShallow;
    if (n === "__v_isReactive")
      return !o;
    if (n === "__v_isReadonly")
      return o;
    if (n === "__v_isShallow")
      return r;
    if (n === "__v_raw")
      return s === (o ? r ? br : Er : r ? vr : _r).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const i = A(t);
    if (!o) {
      let u;
      if (i && (u = Ri[n]))
        return u;
      if (n === "hasOwnProperty")
        return Fi;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ oe(t) ? t : s
    );
    if ((De(n) ? pr.has(n) : ji(n)) || (o || le(t, "get", n), r))
      return l;
    if (/* @__PURE__ */ oe(l)) {
      const u = i && Ps(n) ? l : l.value;
      return o && W(u) ? /* @__PURE__ */ Es(u) : u;
    }
    return W(l) ? o ? /* @__PURE__ */ Es(l) : /* @__PURE__ */ bt(l) : l;
  }
}
class gr extends hr {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, o) {
    let r = t[n];
    const i = A(t) && Ps(n);
    if (!this._isShallow) {
      const p = /* @__PURE__ */ Ie(r);
      if (!/* @__PURE__ */ ve(s) && !/* @__PURE__ */ Ie(s) && (r = /* @__PURE__ */ k(r), s = /* @__PURE__ */ k(s)), !i && /* @__PURE__ */ oe(r) && !/* @__PURE__ */ oe(s))
        return p ? (process.env.NODE_ENV !== "production" && Ae(
          `Set operation on key "${String(n)}" failed: target is readonly.`,
          t[n]
        ), !0) : (r.value = s, !0);
    }
    const l = i ? Number(n) < t.length : U(t, n), u = Reflect.set(
      t,
      n,
      s,
      /* @__PURE__ */ oe(t) ? t : o
    );
    return t === /* @__PURE__ */ k(o) && (l ? Ge(s, r) && Je(t, "set", n, s, r) : Je(t, "add", n, s)), u;
  }
  deleteProperty(t, n) {
    const s = U(t, n), o = t[n], r = Reflect.deleteProperty(t, n);
    return r && s && Je(t, "delete", n, void 0, o), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!De(n) || !pr.has(n)) && le(t, "has", n), s;
  }
  ownKeys(t) {
    return le(
      t,
      "iterate",
      A(t) ? "length" : _t
    ), Reflect.ownKeys(t);
  }
}
class mr extends hr {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return process.env.NODE_ENV !== "production" && Ae(
      `Set operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
  deleteProperty(t, n) {
    return process.env.NODE_ENV !== "production" && Ae(
      `Delete operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
}
const Hi = /* @__PURE__ */ new gr(), Li = /* @__PURE__ */ new mr(), Ui = /* @__PURE__ */ new gr(!0), Ki = /* @__PURE__ */ new mr(!0), vs = (e) => e, bn = (e) => Reflect.getPrototypeOf(e);
function Bi(e, t, n) {
  return function(...s) {
    const o = this.__v_raw, r = /* @__PURE__ */ k(o), i = mt(r), l = e === "entries" || e === Symbol.iterator && i, u = e === "keys" && i, p = o[e](...s), d = n ? vs : t ? Mt : Re;
    return !t && le(
      r,
      "iterate",
      u ? _s : _t
    ), re(
      // inheriting all iterator properties
      Object.create(p),
      {
        // iterator protocol
        next() {
          const { value: a, done: g } = p.next();
          return g ? { value: a, done: g } : {
            value: l ? [d(a[0]), d(a[1])] : d(a),
            done: g
          };
        }
      }
    );
  };
}
function yn(e) {
  return function(...t) {
    if (process.env.NODE_ENV !== "production") {
      const n = t[0] ? `on key "${t[0]}" ` : "";
      Ae(
        `${Kn(e)} operation ${n}failed: target is readonly.`,
        /* @__PURE__ */ k(this)
      );
    }
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Wi(e, t) {
  const n = {
    get(o) {
      const r = this.__v_raw, i = /* @__PURE__ */ k(r), l = /* @__PURE__ */ k(o);
      e || (Ge(o, l) && le(i, "get", o), le(i, "get", l));
      const { has: u } = bn(i), p = t ? vs : e ? Mt : Re;
      if (u.call(i, o))
        return p(r.get(o));
      if (u.call(i, l))
        return p(r.get(l));
      r !== i && r.get(o);
    },
    get size() {
      const o = this.__v_raw;
      return !e && le(/* @__PURE__ */ k(o), "iterate", _t), o.size;
    },
    has(o) {
      const r = this.__v_raw, i = /* @__PURE__ */ k(r), l = /* @__PURE__ */ k(o);
      return e || (Ge(o, l) && le(i, "has", o), le(i, "has", l)), o === l ? r.has(o) : r.has(o) || r.has(l);
    },
    forEach(o, r) {
      const i = this, l = i.__v_raw, u = /* @__PURE__ */ k(l), p = t ? vs : e ? Mt : Re;
      return !e && le(u, "iterate", _t), l.forEach((d, a) => o.call(r, p(d), p(a), i));
    }
  };
  return re(
    n,
    e ? {
      add: yn("add"),
      set: yn("set"),
      delete: yn("delete"),
      clear: yn("clear")
    } : {
      add(o) {
        const r = /* @__PURE__ */ k(this), i = bn(r), l = /* @__PURE__ */ k(o), u = !t && !/* @__PURE__ */ ve(o) && !/* @__PURE__ */ Ie(o) ? l : o;
        return i.has.call(r, u) || Ge(o, u) && i.has.call(r, o) || Ge(l, u) && i.has.call(r, l) || (r.add(u), Je(r, "add", u, u)), this;
      },
      set(o, r) {
        !t && !/* @__PURE__ */ ve(r) && !/* @__PURE__ */ Ie(r) && (r = /* @__PURE__ */ k(r));
        const i = /* @__PURE__ */ k(this), { has: l, get: u } = bn(i);
        let p = l.call(i, o);
        p ? process.env.NODE_ENV !== "production" && fo(i, l, o) : (o = /* @__PURE__ */ k(o), p = l.call(i, o));
        const d = u.call(i, o);
        return i.set(o, r), p ? Ge(r, d) && Je(i, "set", o, r, d) : Je(i, "add", o, r), this;
      },
      delete(o) {
        const r = /* @__PURE__ */ k(this), { has: i, get: l } = bn(r);
        let u = i.call(r, o);
        u ? process.env.NODE_ENV !== "production" && fo(r, i, o) : (o = /* @__PURE__ */ k(o), u = i.call(r, o));
        const p = l ? l.call(r, o) : void 0, d = r.delete(o);
        return u && Je(r, "delete", o, void 0, p), d;
      },
      clear() {
        const o = /* @__PURE__ */ k(this), r = o.size !== 0, i = process.env.NODE_ENV !== "production" ? mt(o) ? new Map(o) : new Set(o) : void 0, l = o.clear();
        return r && Je(
          o,
          "clear",
          void 0,
          void 0,
          i
        ), l;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((o) => {
    n[o] = Bi(o, e, t);
  }), n;
}
function qn(e, t) {
  const n = Wi(e, t);
  return (s, o, r) => o === "__v_isReactive" ? !e : o === "__v_isReadonly" ? e : o === "__v_raw" ? s : Reflect.get(
    U(n, o) && o in s ? n : s,
    o,
    r
  );
}
const qi = {
  get: /* @__PURE__ */ qn(!1, !1)
}, Gi = {
  get: /* @__PURE__ */ qn(!1, !0)
}, Ji = {
  get: /* @__PURE__ */ qn(!0, !1)
}, Yi = {
  get: /* @__PURE__ */ qn(!0, !0)
};
function fo(e, t, n) {
  const s = /* @__PURE__ */ k(n);
  if (s !== n && t.call(e, s)) {
    const o = As(e);
    Ae(
      `Reactive ${o} contains both the raw and reactive versions of the same object${o === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const _r = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap();
function zi(e) {
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
function bt(e) {
  return /* @__PURE__ */ Ie(e) ? e : Gn(
    e,
    !1,
    Hi,
    qi,
    _r
  );
}
// @__NO_SIDE_EFFECTS__
function Xi(e) {
  return Gn(
    e,
    !1,
    Ui,
    Gi,
    vr
  );
}
// @__NO_SIDE_EFFECTS__
function Es(e) {
  return Gn(
    e,
    !0,
    Li,
    Ji,
    Er
  );
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return Gn(
    e,
    !0,
    Ki,
    Yi,
    br
  );
}
function Gn(e, t, n, s, o) {
  if (!W(e))
    return process.env.NODE_ENV !== "production" && Ae(
      `value cannot be made ${t ? "readonly" : "reactive"}: ${String(
        e
      )}`
    ), e;
  if (e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const r = o.get(e);
  if (r)
    return r;
  const i = zi(As(e));
  if (i === 0)
    return e;
  const l = new Proxy(
    e,
    i === 2 ? s : n
  );
  return o.set(e, l), l;
}
// @__NO_SIDE_EFFECTS__
function ut(e) {
  return /* @__PURE__ */ Ie(e) ? /* @__PURE__ */ ut(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Ie(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function ve(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function An(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function k(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ k(t) : e;
}
function Zi(e) {
  return !U(e, "__v_skip") && Object.isExtensible(e) && $n(e, "__v_skip", !0), e;
}
const Re = (e) => W(e) ? /* @__PURE__ */ bt(e) : e, Mt = (e) => W(e) ? /* @__PURE__ */ Es(e) : e;
// @__NO_SIDE_EFFECTS__
function oe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  return Qi(e, !1);
}
function Qi(e, t) {
  return /* @__PURE__ */ oe(e) ? e : new el(e, t);
}
class el {
  constructor(t, n) {
    this.dep = new Fs(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : /* @__PURE__ */ k(t), this._value = n ? t : Re(t), this.__v_isShallow = n;
  }
  get value() {
    return process.env.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || /* @__PURE__ */ ve(t) || /* @__PURE__ */ Ie(t);
    t = s ? t : /* @__PURE__ */ k(t), Ge(t, n) && (this._rawValue = t, this._value = s ? t : Re(t), process.env.NODE_ENV !== "production" ? this.dep.trigger({
      target: this,
      type: "set",
      key: "value",
      newValue: t,
      oldValue: n
    }) : this.dep.trigger());
  }
}
function j(e) {
  return /* @__PURE__ */ oe(e) ? e.value : e;
}
const tl = {
  get: (e, t, n) => t === "__v_raw" ? e : j(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const o = e[t];
    return /* @__PURE__ */ oe(o) && !/* @__PURE__ */ oe(n) ? (o.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function yr(e) {
  return /* @__PURE__ */ ut(e) ? e : new Proxy(e, tl);
}
class nl {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Fs(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = tn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Y !== this)
      return lr(this, !0), !0;
    process.env.NODE_ENV;
  }
  get value() {
    const t = process.env.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track();
    return ar(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter ? this.setter(t) : process.env.NODE_ENV !== "production" && Ae("Write operation failed: computed value is readonly");
  }
}
// @__NO_SIDE_EFFECTS__
function sl(e, t, n = !1) {
  let s, o;
  I(e) ? s = e : (s = e.get, o = e.set);
  const r = new nl(s, o, n);
  return process.env.NODE_ENV, r;
}
const Nn = {}, Pn = /* @__PURE__ */ new WeakMap();
let gt;
function ol(e, t = !1, n = gt) {
  if (n) {
    let s = Pn.get(n);
    s || Pn.set(n, s = []), s.push(e);
  } else process.env.NODE_ENV !== "production" && !t && Ae(
    "onWatcherCleanup() was called when there was no active watcher to associate with."
  );
}
function rl(e, t, n = z) {
  const { immediate: s, deep: o, once: r, scheduler: i, augmentJob: l, call: u } = n, p = (x) => {
    (n.onWarn || Ae)(
      "Invalid watch source: ",
      x,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, d = (x) => o ? x : /* @__PURE__ */ ve(x) || o === !1 || o === 0 ? tt(x, 1) : tt(x);
  let a, g, b, M, C = !1, Q = !1;
  if (/* @__PURE__ */ oe(e) ? (g = () => e.value, C = /* @__PURE__ */ ve(e)) : /* @__PURE__ */ ut(e) ? (g = () => d(e), C = !0) : A(e) ? (Q = !0, C = e.some((x) => /* @__PURE__ */ ut(x) || /* @__PURE__ */ ve(x)), g = () => e.map((x) => {
    if (/* @__PURE__ */ oe(x))
      return x.value;
    if (/* @__PURE__ */ ut(x))
      return d(x);
    if (I(x))
      return u ? u(x, 2) : x();
    process.env.NODE_ENV !== "production" && p(x);
  })) : I(e) ? t ? g = u ? () => u(e, 2) : e : g = () => {
    if (b) {
      Pe();
      try {
        b();
      } finally {
        Me();
      }
    }
    const x = gt;
    gt = a;
    try {
      return u ? u(e, 3, [M]) : e(M);
    } finally {
      gt = x;
    }
  } : (g = ce, process.env.NODE_ENV !== "production" && p(e)), t && o) {
    const x = g, w = o === !0 ? 1 / 0 : o;
    g = () => tt(x(), w);
  }
  const X = Pi(), K = () => {
    a.stop(), X && X.active && Ts(X.effects, a);
  };
  if (r && t) {
    const x = t;
    t = (...w) => {
      x(...w), K();
    };
  }
  let F = Q ? new Array(e.length).fill(Nn) : Nn;
  const he = (x) => {
    if (!(!(a.flags & 1) || !a.dirty && !x))
      if (t) {
        const w = a.run();
        if (o || C || (Q ? w.some((ee, ne) => Ge(ee, F[ne])) : Ge(w, F))) {
          b && b();
          const ee = gt;
          gt = a;
          try {
            const ne = [
              w,
              // pass undefined as the old value when it's changed for the first time
              F === Nn ? void 0 : Q && F[0] === Nn ? [] : F,
              M
            ];
            F = w, u ? u(t, 3, ne) : (
              // @ts-expect-error
              t(...ne)
            );
          } finally {
            gt = ee;
          }
        }
      } else
        a.run();
  };
  return l && l(he), a = new rr(g), a.scheduler = i ? () => i(he, !1) : he, M = (x) => ol(x, !1, a), b = a.onStop = () => {
    const x = Pn.get(a);
    if (x) {
      if (u)
        u(x, 4);
      else
        for (const w of x) w();
      Pn.delete(a);
    }
  }, process.env.NODE_ENV !== "production" && (a.onTrack = n.onTrack, a.onTrigger = n.onTrigger), t ? s ? he(!0) : F = a.run() : i ? i(he.bind(null, !0), !0) : a.run(), K.pause = a.pause.bind(a), K.resume = a.resume.bind(a), K.stop = K, K;
}
function tt(e, t = 1 / 0, n) {
  if (t <= 0 || !W(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, /* @__PURE__ */ oe(e))
    tt(e.value, t, n);
  else if (A(e))
    for (let s = 0; s < e.length; s++)
      tt(e[s], t, n);
  else if (Qo(e) || mt(e))
    e.forEach((s) => {
      tt(s, t, n);
    });
  else if (tr(e)) {
    for (const s in e)
      tt(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && tt(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const vt = [];
function wn(e) {
  vt.push(e);
}
function xn() {
  vt.pop();
}
let is = !1;
function O(e, ...t) {
  if (is) return;
  is = !0, Pe();
  const n = vt.length ? vt[vt.length - 1].component : null, s = n && n.appContext.config.warnHandler, o = il();
  if (s)
    Rt(
      s,
      n,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        e + t.map((r) => {
          var i, l;
          return (l = (i = r.toString) == null ? void 0 : i.call(r)) != null ? l : JSON.stringify(r);
        }).join(""),
        n && n.proxy,
        o.map(
          ({ vnode: r }) => `at <${mn(n, r.type)}>`
        ).join(`
`),
        o
      ]
    );
  else {
    const r = [`[Vue warn]: ${e}`, ...t];
    o.length && r.push(`
`, ...ll(o)), console.warn(...r);
  }
  Me(), is = !1;
}
function il() {
  let e = vt[vt.length - 1];
  if (!e)
    return [];
  const t = [];
  for (; e; ) {
    const n = t[0];
    n && n.vnode === e ? n.recurseCount++ : t.push({
      vnode: e,
      recurseCount: 0
    });
    const s = e.component && e.component.parent;
    e = s && s.vnode;
  }
  return t;
}
function ll(e) {
  const t = [];
  return e.forEach((n, s) => {
    t.push(...s === 0 ? [] : [`
`], ...cl(n));
  }), t;
}
function cl({ vnode: e, recurseCount: t }) {
  const n = t > 0 ? `... (${t} recursive calls)` : "", s = e.component ? e.component.parent == null : !1, o = ` at <${mn(
    e.component,
    e.type,
    s
  )}`, r = ">" + n;
  return e.props ? [o, ...ul(e.props), r] : [o + r];
}
function ul(e) {
  const t = [], n = Object.keys(e);
  return n.slice(0, 3).forEach((s) => {
    t.push(...Nr(s, e[s]));
  }), n.length > 3 && t.push(" ..."), t;
}
function Nr(e, t, n) {
  return Z(t) ? (t = JSON.stringify(t), n ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? n ? t : [`${e}=${t}`] : /* @__PURE__ */ oe(t) ? (t = Nr(e, /* @__PURE__ */ k(t.value), !0), n ? t : [`${e}=Ref<`, t, ">"]) : I(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = /* @__PURE__ */ k(t), n ? t : [`${e}=`, t]);
}
const Hs = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush",
  15: "component update",
  16: "app unmount cleanup function"
};
function Rt(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (o) {
    an(o, t, n);
  }
}
function ke(e, t, n, s) {
  if (I(e)) {
    const o = Rt(e, t, n, s);
    return o && $s(o) && o.catch((r) => {
      an(r, t, n);
    }), o;
  }
  if (A(e)) {
    const o = [];
    for (let r = 0; r < e.length; r++)
      o.push(ke(e[r], t, n, s));
    return o;
  } else process.env.NODE_ENV !== "production" && O(
    `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof e}`
  );
}
function an(e, t, n, s = !0) {
  const o = t ? t.vnode : null, { errorHandler: r, throwUnhandledErrorInProduction: i } = t && t.appContext.config || z;
  if (t) {
    let l = t.parent;
    const u = t.proxy, p = process.env.NODE_ENV !== "production" ? Hs[n] : `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const d = l.ec;
      if (d) {
        for (let a = 0; a < d.length; a++)
          if (d[a](e, u, p) === !1)
            return;
      }
      l = l.parent;
    }
    if (r) {
      Pe(), Rt(r, null, 10, [
        e,
        u,
        p
      ]), Me();
      return;
    }
  }
  al(e, n, o, s, i);
}
function al(e, t, n, s = !0, o = !1) {
  if (process.env.NODE_ENV !== "production") {
    const r = Hs[t];
    if (n && wn(n), O(`Unhandled error${r ? ` during execution of ${r}` : ""}`), n && xn(), s)
      throw e;
    console.error(e);
  } else {
    if (o)
      throw e;
    console.error(e);
  }
}
const _e = [];
let Ke = -1;
const $t = [];
let ct = null, St = 0;
const Or = /* @__PURE__ */ Promise.resolve();
let Mn = null;
const fl = 100;
function dl(e) {
  const t = Mn || Or;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function pl(e) {
  let t = Ke + 1, n = _e.length;
  for (; t < n; ) {
    const s = t + n >>> 1, o = _e[s], r = sn(o);
    r < e || r === e && o.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Jn(e) {
  if (!(e.flags & 1)) {
    const t = sn(e), n = _e[_e.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= sn(n) ? _e.push(e) : _e.splice(pl(t), 0, e), e.flags |= 1, wr();
  }
}
function wr() {
  Mn || (Mn = Or.then(Dr));
}
function xr(e) {
  A(e) ? $t.push(...e) : ct && e.id === -1 ? ct.splice(St + 1, 0, e) : e.flags & 1 || ($t.push(e), e.flags |= 1), wr();
}
function po(e, t, n = Ke + 1) {
  for (process.env.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map()); n < _e.length; n++) {
    const s = _e[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid || process.env.NODE_ENV !== "production" && Ls(t, s))
        continue;
      _e.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Vr(e) {
  if ($t.length) {
    const t = [...new Set($t)].sort(
      (n, s) => sn(n) - sn(s)
    );
    if ($t.length = 0, ct) {
      ct.push(...t);
      return;
    }
    for (ct = t, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), St = 0; St < ct.length; St++) {
      const n = ct[St];
      process.env.NODE_ENV !== "production" && Ls(e, n) || (n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2);
    }
    ct = null, St = 0;
  }
}
const sn = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Dr(e) {
  process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map());
  const t = process.env.NODE_ENV !== "production" ? (n) => Ls(e, n) : ce;
  try {
    for (Ke = 0; Ke < _e.length; Ke++) {
      const n = _e[Ke];
      if (n && !(n.flags & 8)) {
        if (process.env.NODE_ENV !== "production" && t(n))
          continue;
        n.flags & 4 && (n.flags &= -2), Rt(
          n,
          n.i,
          n.i ? 15 : 14
        ), n.flags & 4 || (n.flags &= -2);
      }
    }
  } finally {
    for (; Ke < _e.length; Ke++) {
      const n = _e[Ke];
      n && (n.flags &= -2);
    }
    Ke = -1, _e.length = 0, Vr(e), Mn = null, (_e.length || $t.length) && Dr(e);
  }
}
function Ls(e, t) {
  const n = e.get(t) || 0;
  if (n > fl) {
    const s = t.i, o = s && ui(s.type);
    return an(
      `Maximum recursive updates exceeded${o ? ` in component <${o}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    ), !0;
  }
  return e.set(t, n + 1), !1;
}
let xe = !1;
const ho = (e) => {
  try {
    return xe;
  } finally {
    xe = e;
  }
}, Vn = /* @__PURE__ */ new Map();
process.env.NODE_ENV !== "production" && (un().__VUE_HMR_RUNTIME__ = {
  createRecord: ls(Sr),
  rerender: ls(ml),
  reload: ls(_l)
});
const yt = /* @__PURE__ */ new Map();
function hl(e) {
  const t = e.type.__hmrId;
  let n = yt.get(t);
  n || (Sr(t, e.type), n = yt.get(t)), n.instances.add(e);
}
function gl(e) {
  yt.get(e.type.__hmrId).instances.delete(e);
}
function Sr(e, t) {
  return yt.has(e) ? !1 : (yt.set(e, {
    initialDef: In(t),
    instances: /* @__PURE__ */ new Set()
  }), !0);
}
function In(e) {
  return ai(e) ? e.__vccOpts : e;
}
function ml(e, t) {
  const n = yt.get(e);
  n && (n.initialDef.render = t, [...n.instances].forEach((s) => {
    t && (s.render = t, In(s.type).render = t), s.renderCache = [], xe = !0, s.job.flags & 8 || s.update(), xe = !1;
  }));
}
function _l(e, t) {
  const n = yt.get(e);
  if (!n) return;
  t = In(t), go(n.initialDef, t);
  const s = [...n.instances];
  for (let o = 0; o < s.length; o++) {
    const r = s[o], i = In(r.type);
    let l = Vn.get(i);
    l || (i !== n.initialDef && go(i, t), Vn.set(i, l = /* @__PURE__ */ new Set())), l.add(r), r.appContext.propsCache.delete(r.type), r.appContext.emitsCache.delete(r.type), r.appContext.optionsCache.delete(r.type), r.ceReload ? (l.add(r), r.ceReload(t.styles), l.delete(r)) : r.parent ? Jn(() => {
      r.job.flags & 8 || (xe = !0, r.parent.update(), xe = !1, l.delete(r));
    }) : r.appContext.reload ? r.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    ), r.root.ce && r !== r.root && r.root.ce._removeChildStyle(i);
  }
  xr(() => {
    Vn.clear();
  });
}
function go(e, t) {
  re(e, t);
  for (const n in e)
    n !== "__file" && !(n in t) && delete e[n];
}
function ls(e) {
  return (t, n) => {
    try {
      return e(t, n);
    } catch (s) {
      console.error(s), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let Te, Bt = [], bs = !1;
function fn(e, ...t) {
  Te ? Te.emit(e, ...t) : bs || Bt.push({ event: e, args: t });
}
function Us(e, t) {
  var n, s;
  Te = e, Te ? (Te.enabled = !0, Bt.forEach(({ event: o, args: r }) => Te.emit(o, ...r)), Bt = []) : /* handle late devtools injection - only do this if we are in an actual */ /* browser environment to avoid the timer handle stalling test runner exit */ /* (#4815) */ typeof window < "u" && // some envs mock window but not fully
  window.HTMLElement && // also exclude jsdom
  // eslint-disable-next-line no-restricted-syntax
  !((s = (n = window.navigator) == null ? void 0 : n.userAgent) != null && s.includes("jsdom")) ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((r) => {
    Us(r, t);
  }), setTimeout(() => {
    Te || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, bs = !0, Bt = []);
  }, 3e3)) : (bs = !0, Bt = []);
}
function vl(e, t) {
  fn("app:init", e, t, {
    Fragment: pe,
    Text: pn,
    Comment: we,
    Static: Cn
  });
}
function El(e) {
  fn("app:unmount", e);
}
const bl = /* @__PURE__ */ Ks(
  "component:added"
  /* COMPONENT_ADDED */
), Cr = /* @__PURE__ */ Ks(
  "component:updated"
  /* COMPONENT_UPDATED */
), yl = /* @__PURE__ */ Ks(
  "component:removed"
  /* COMPONENT_REMOVED */
), Nl = (e) => {
  Te && typeof Te.cleanupBuffer == "function" && // remove the component if it wasn't buffered
  !Te.cleanupBuffer(e) && yl(e);
};
// @__NO_SIDE_EFFECTS__
function Ks(e) {
  return (t) => {
    fn(
      e,
      t.appContext.app,
      t.uid,
      t.parent ? t.parent.uid : void 0,
      t
    );
  };
}
const Ol = /* @__PURE__ */ Tr(
  "perf:start"
  /* PERFORMANCE_START */
), wl = /* @__PURE__ */ Tr(
  "perf:end"
  /* PERFORMANCE_END */
);
function Tr(e) {
  return (t, n, s) => {
    fn(e, t.appContext.app, t.uid, t, n, s);
  };
}
function xl(e, t, n) {
  fn(
    "component:emit",
    e.appContext.app,
    e,
    t,
    n
  );
}
let ue = null, $r = null;
function Rn(e) {
  const t = ue;
  return ue = e, $r = e && e.type.__scopeId || null, t;
}
function Yn(e, t = ue, n) {
  if (!t || e._n)
    return e;
  const s = (...o) => {
    s._d && $o(-1);
    const r = Rn(t);
    let i;
    try {
      i = e(...o);
    } finally {
      Rn(r), s._d && $o(1);
    }
    return process.env.NODE_ENV !== "production" && Cr(t), i;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Ar(e) {
  mi(e) && O("Do not use built-in directive ids as custom directive id: " + e);
}
function Be(e, t) {
  if (ue === null)
    return process.env.NODE_ENV !== "production" && O("withDirectives can only be used inside render functions."), e;
  const n = Zn(ue), s = e.dirs || (e.dirs = []);
  for (let o = 0; o < t.length; o++) {
    let [r, i, l, u = z] = t[o];
    r && (I(r) && (r = {
      mounted: r,
      updated: r
    }), r.deep && tt(i), s.push({
      dir: r,
      instance: n,
      value: i,
      oldValue: void 0,
      arg: l,
      modifiers: u
    }));
  }
  return e;
}
function dt(e, t, n, s) {
  const o = e.dirs, r = t && t.dirs;
  for (let i = 0; i < o.length; i++) {
    const l = o[i];
    r && (l.oldValue = r[i].value);
    let u = l.dir[s];
    u && (Pe(), ke(u, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Me());
  }
}
function Vl(e, t) {
  if (process.env.NODE_ENV !== "production" && (!ie || ie.isMounted) && O("provide() can only be used inside setup()."), ie) {
    let n = ie.provides;
    const s = ie.parent && ie.parent.provides;
    s === n && (n = ie.provides = Object.create(s)), n[e] = t;
  }
}
function Dn(e, t, n = !1) {
  const s = ii();
  if (s || Pt) {
    let o = Pt ? Pt._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (o && e in o)
      return o[e];
    if (arguments.length > 1)
      return n && I(t) ? t.call(s && s.proxy) : t;
    process.env.NODE_ENV !== "production" && O(`injection "${String(e)}" not found.`);
  } else process.env.NODE_ENV !== "production" && O("inject() can only be used inside setup() or functional components.");
}
const Dl = /* @__PURE__ */ Symbol.for("v-scx"), Sl = () => {
  {
    const e = Dn(Dl);
    return e || process.env.NODE_ENV !== "production" && O(
      "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
    ), e;
  }
};
function cs(e, t, n) {
  return process.env.NODE_ENV !== "production" && !I(t) && O(
    "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
  ), Pr(e, t, n);
}
function Pr(e, t, n = z) {
  const { immediate: s, deep: o, flush: r, once: i } = n;
  process.env.NODE_ENV !== "production" && !t && (s !== void 0 && O(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), o !== void 0 && O(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ), i !== void 0 && O(
    'watch() "once" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const l = re({}, n);
  process.env.NODE_ENV !== "production" && (l.onWarn = O);
  const u = t && s || !t && r !== "post";
  let p;
  if (rn) {
    if (r === "sync") {
      const b = Sl();
      p = b.__watcherHandles || (b.__watcherHandles = []);
    } else if (!u) {
      const b = () => {
      };
      return b.stop = ce, b.resume = ce, b.pause = ce, b;
    }
  }
  const d = ie;
  l.call = (b, M, C) => ke(b, d, M, C);
  let a = !1;
  r === "post" ? l.scheduler = (b) => {
    Ne(b, d && d.suspense);
  } : r !== "sync" && (a = !0, l.scheduler = (b, M) => {
    M ? b() : Jn(b);
  }), l.augmentJob = (b) => {
    t && (b.flags |= 4), a && (b.flags |= 2, d && (b.id = d.uid, b.i = d));
  };
  const g = rl(e, t, l);
  return rn && (p ? p.push(g) : u && g()), g;
}
function Cl(e, t, n) {
  const s = this.proxy, o = Z(e) ? e.includes(".") ? Mr(s, e) : () => s[e] : e.bind(s, s);
  let r;
  I(t) ? r = t : (r = t.handler, n = t);
  const i = gn(this), l = Pr(o, r.bind(s), n);
  return i(), l;
}
function Mr(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let o = 0; o < n.length && s; o++)
      s = s[n[o]];
    return s;
  };
}
const Tl = /* @__PURE__ */ Symbol("_vte"), $l = (e) => e.__isTeleport, us = /* @__PURE__ */ Symbol("_leaveCb");
function Bs(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Bs(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function Ir(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const mo = /* @__PURE__ */ new WeakSet();
function _o(e, t) {
  let n;
  return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
const kn = /* @__PURE__ */ new WeakMap();
function zt(e, t, n, s, o = !1) {
  if (A(e)) {
    e.forEach(
      (C, Q) => zt(
        C,
        t && (A(t) ? t[Q] : t),
        n,
        s,
        o
      )
    );
    return;
  }
  if (At(s) && !o) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && zt(e, t, n, s.component.subTree);
    return;
  }
  const r = s.shapeFlag & 4 ? Zn(s.component) : s.el, i = o ? null : r, { i: l, r: u } = e;
  if (process.env.NODE_ENV !== "production" && !l) {
    O(
      "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
    );
    return;
  }
  const p = t && t.r, d = l.refs === z ? l.refs = {} : l.refs, a = l.setupState, g = /* @__PURE__ */ k(a), b = a === z ? Zo : (C) => process.env.NODE_ENV !== "production" && (U(g, C) && !/* @__PURE__ */ oe(g[C]) && O(
    `Template ref "${C}" used on a non-ref value. It will not work in the production build.`
  ), mo.has(g[C])) || _o(d, C) ? !1 : U(g, C), M = (C, Q) => !(process.env.NODE_ENV !== "production" && mo.has(C) || Q && _o(d, Q));
  if (p != null && p !== u) {
    if (vo(t), Z(p))
      d[p] = null, b(p) && (a[p] = null);
    else if (/* @__PURE__ */ oe(p)) {
      const C = t;
      M(p, C.k) && (p.value = null), C.k && (d[C.k] = null);
    }
  }
  if (I(u))
    Rt(u, l, 12, [i, d]);
  else {
    const C = Z(u), Q = /* @__PURE__ */ oe(u);
    if (C || Q) {
      const X = () => {
        if (e.f) {
          const K = C ? b(u) ? a[u] : d[u] : M(u) || !e.k ? u.value : d[e.k];
          if (o)
            A(K) && Ts(K, r);
          else if (A(K))
            K.includes(r) || K.push(r);
          else if (C)
            d[u] = [r], b(u) && (a[u] = d[u]);
          else {
            const F = [r];
            M(u, e.k) && (u.value = F), e.k && (d[e.k] = F);
          }
        } else C ? (d[u] = i, b(u) && (a[u] = i)) : Q ? (M(u, e.k) && (u.value = i), e.k && (d[e.k] = i)) : process.env.NODE_ENV !== "production" && O("Invalid template ref type:", u, `(${typeof u})`);
      };
      if (i) {
        const K = () => {
          X(), kn.delete(e);
        };
        K.id = -1, kn.set(e, K), Ne(K, n);
      } else
        vo(e), X();
    } else process.env.NODE_ENV !== "production" && O("Invalid template ref type:", u, `(${typeof u})`);
  }
}
function vo(e) {
  const t = kn.get(e);
  t && (t.flags |= 8, kn.delete(e));
}
un().requestIdleCallback;
un().cancelIdleCallback;
const At = (e) => !!e.type.__asyncLoader, Ws = (e) => e.type.__isKeepAlive;
function Al(e, t) {
  Rr(e, "a", t);
}
function Pl(e, t) {
  Rr(e, "da", t);
}
function Rr(e, t, n = ie) {
  const s = e.__wdc || (e.__wdc = () => {
    let o = n;
    for (; o; ) {
      if (o.isDeactivated)
        return;
      o = o.parent;
    }
    return e();
  });
  if (zn(t, s, n), n) {
    let o = n.parent;
    for (; o && o.parent; )
      Ws(o.parent.vnode) && Ml(s, t, n, o), o = o.parent;
  }
}
function Ml(e, t, n, s) {
  const o = zn(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  qs(() => {
    Ts(s[t], o);
  }, n);
}
function zn(e, t, n = ie, s = !1) {
  if (n) {
    const o = n[e] || (n[e] = []), r = t.__weh || (t.__weh = (...i) => {
      Pe();
      const l = gn(n), u = ke(t, n, e, i);
      return l(), Me(), u;
    });
    return s ? o.unshift(r) : o.push(r), r;
  } else if (process.env.NODE_ENV !== "production") {
    const o = ht(Hs[e].replace(/ hook$/, ""));
    O(
      `${o} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
    );
  }
}
const ot = (e) => (t, n = ie) => {
  (!rn || e === "sp") && zn(e, (...s) => t(...s), n);
}, Il = ot("bm"), dn = ot("m"), Rl = ot(
  "bu"
), kl = ot("u"), jl = ot(
  "bum"
), qs = ot("um"), Fl = ot(
  "sp"
), Hl = ot("rtg"), Ll = ot("rtc");
function Ul(e, t = ie) {
  zn("ec", e, t);
}
const Kl = /* @__PURE__ */ Symbol.for("v-ndc");
function On(e, t, n, s) {
  let o;
  const r = n, i = A(e);
  if (i || Z(e)) {
    const l = i && /* @__PURE__ */ ut(e);
    let u = !1, p = !1;
    l && (u = !/* @__PURE__ */ ve(e), p = /* @__PURE__ */ Ie(e), e = Wn(e)), o = new Array(e.length);
    for (let d = 0, a = e.length; d < a; d++)
      o[d] = t(
        u ? p ? Mt(Re(e[d])) : Re(e[d]) : e[d],
        d,
        void 0,
        r
      );
  } else if (typeof e == "number")
    if (process.env.NODE_ENV !== "production" && (!Number.isInteger(e) || e < 0))
      O(
        `The v-for range expects a positive integer value but got ${e}.`
      ), o = [];
    else {
      o = new Array(e);
      for (let l = 0; l < e; l++)
        o[l] = t(l + 1, l, void 0, r);
    }
  else if (W(e))
    if (e[Symbol.iterator])
      o = Array.from(
        e,
        (l, u) => t(l, u, void 0, r)
      );
    else {
      const l = Object.keys(e);
      o = new Array(l.length);
      for (let u = 0, p = l.length; u < p; u++) {
        const d = l[u];
        o[u] = t(e[d], d, u, r);
      }
    }
  else
    o = [];
  return o;
}
function Eo(e, t, n = {}, s, o) {
  if (ue.ce || ue.parent && At(ue.parent) && ue.parent.ce) {
    const p = Object.keys(n).length > 0;
    return t !== "default" && (n.name = t), te(), It(
      pe,
      null,
      [Ee("slot", n, s)],
      p ? -2 : 64
    );
  }
  let r = e[t];
  process.env.NODE_ENV !== "production" && r && r.length > 1 && (O(
    "SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template."
  ), r = () => []), r && r._c && (r._d = !1), te();
  const i = r && kr(r(n)), l = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  i && i.key, u = It(
    pe,
    {
      key: (l && !De(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!i && s ? "_fb" : "")
    },
    i || [],
    i && e._ === 1 ? 64 : -2
  );
  return r && r._c && (r._d = !0), u;
}
function kr(e) {
  return e.some((t) => hn(t) ? !(t.type === we || t.type === pe && !kr(t.children)) : !0) ? e : null;
}
const ys = (e) => e ? li(e) ? Zn(e) : ys(e.parent) : null, Et = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ re(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(e.props) : e.props,
    $attrs: (e) => process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(e.attrs) : e.attrs,
    $slots: (e) => process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(e.slots) : e.slots,
    $refs: (e) => process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(e.refs) : e.refs,
    $parent: (e) => ys(e.parent),
    $root: (e) => ys(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Hr(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Jn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = dl.bind(e.proxy)),
    $watch: (e) => Cl.bind(e)
  })
), Gs = (e) => e === "_" || e === "$", as = (e, t) => e !== z && !e.__isScriptSetup && U(e, t), jr = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: o, props: r, accessCache: i, type: l, appContext: u } = e;
    if (process.env.NODE_ENV !== "production" && t === "__isVue")
      return !0;
    if (t[0] !== "$") {
      const g = i[t];
      if (g !== void 0)
        switch (g) {
          case 1:
            return s[t];
          case 2:
            return o[t];
          case 4:
            return n[t];
          case 3:
            return r[t];
        }
      else {
        if (as(s, t))
          return i[t] = 1, s[t];
        if (o !== z && U(o, t))
          return i[t] = 2, o[t];
        if (U(r, t))
          return i[t] = 3, r[t];
        if (n !== z && U(n, t))
          return i[t] = 4, n[t];
        Ns && (i[t] = 0);
      }
    }
    const p = Et[t];
    let d, a;
    if (p)
      return t === "$attrs" ? (le(e.attrs, "get", ""), process.env.NODE_ENV !== "production" && Fn()) : process.env.NODE_ENV !== "production" && t === "$slots" && le(e, "get", t), p(e);
    if (
      // css module (injected by vue-loader)
      (d = l.__cssModules) && (d = d[t])
    )
      return d;
    if (n !== z && U(n, t))
      return i[t] = 4, n[t];
    if (
      // global properties
      a = u.config.globalProperties, U(a, t)
    )
      return a[t];
    process.env.NODE_ENV !== "production" && ue && (!Z(t) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    t.indexOf("__v") !== 0) && (o !== z && Gs(t[0]) && U(o, t) ? O(
      `Property ${JSON.stringify(
        t
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : e === ue && O(
      `Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: o, ctx: r } = e;
    return as(o, t) ? (o[t] = n, !0) : process.env.NODE_ENV !== "production" && o.__isScriptSetup && U(o, t) ? (O(`Cannot mutate <script setup> binding "${t}" from Options API.`), !1) : s !== z && U(s, t) ? (s[t] = n, !0) : U(e.props, t) ? (process.env.NODE_ENV !== "production" && O(`Attempting to mutate prop "${t}". Props are readonly.`), !1) : t[0] === "$" && t.slice(1) in e ? (process.env.NODE_ENV !== "production" && O(
      `Attempting to mutate public property "${t}". Properties starting with $ are reserved and readonly.`
    ), !1) : (process.env.NODE_ENV !== "production" && t in e.appContext.config.globalProperties ? Object.defineProperty(r, t, {
      enumerable: !0,
      configurable: !0,
      value: n
    }) : r[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: o, props: r, type: i }
  }, l) {
    let u;
    return !!(n[l] || e !== z && l[0] !== "$" && U(e, l) || as(t, l) || U(r, l) || U(s, l) || U(Et, l) || U(o.config.globalProperties, l) || (u = i.__cssModules) && u[l]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : U(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
process.env.NODE_ENV !== "production" && (jr.ownKeys = (e) => (O(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(e)));
function Bl(e) {
  const t = {};
  return Object.defineProperty(t, "_", {
    configurable: !0,
    enumerable: !1,
    get: () => e
  }), Object.keys(Et).forEach((n) => {
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !1,
      get: () => Et[n](e),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: ce
    });
  }), t;
}
function Wl(e) {
  const {
    ctx: t,
    propsOptions: [n]
  } = e;
  n && Object.keys(n).forEach((s) => {
    Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => e.props[s],
      set: ce
    });
  });
}
function ql(e) {
  const { ctx: t, setupState: n } = e;
  Object.keys(/* @__PURE__ */ k(n)).forEach((s) => {
    if (!n.__isScriptSetup) {
      if (Gs(s[0])) {
        O(
          `setup() return property ${JSON.stringify(
            s
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(t, s, {
        enumerable: !0,
        configurable: !0,
        get: () => n[s],
        set: ce
      });
    }
  });
}
function bo(e) {
  return A(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function Gl() {
  const e = /* @__PURE__ */ Object.create(null);
  return (t, n) => {
    e[n] ? O(`${t} property "${n}" is already defined in ${e[n]}.`) : e[n] = t;
  };
}
let Ns = !0;
function Jl(e) {
  const t = Hr(e), n = e.proxy, s = e.ctx;
  Ns = !1, t.beforeCreate && yo(t.beforeCreate, e, "bc");
  const {
    // state
    data: o,
    computed: r,
    methods: i,
    watch: l,
    provide: u,
    inject: p,
    // lifecycle
    created: d,
    beforeMount: a,
    mounted: g,
    beforeUpdate: b,
    updated: M,
    activated: C,
    deactivated: Q,
    beforeDestroy: X,
    beforeUnmount: K,
    destroyed: F,
    unmounted: he,
    render: x,
    renderTracked: w,
    renderTriggered: ee,
    errorCaptured: ne,
    serverPrefetch: T,
    // public API
    expose: be,
    inheritAttrs: rt,
    // assets
    components: Se,
    directives: vn,
    filters: no
  } = t, it = process.env.NODE_ENV !== "production" ? Gl() : null;
  if (process.env.NODE_ENV !== "production") {
    const [L] = e.propsOptions;
    if (L)
      for (const H in L)
        it("Props", H);
  }
  if (p && Yl(p, s, it), i)
    for (const L in i) {
      const H = i[L];
      I(H) ? (process.env.NODE_ENV !== "production" ? Object.defineProperty(s, L, {
        value: H.bind(n),
        configurable: !0,
        enumerable: !0,
        writable: !0
      }) : s[L] = H.bind(n), process.env.NODE_ENV !== "production" && it("Methods", L)) : process.env.NODE_ENV !== "production" && O(
        `Method "${L}" has type "${typeof H}" in the component definition. Did you reference the function correctly?`
      );
    }
  if (o) {
    process.env.NODE_ENV !== "production" && !I(o) && O(
      "The data option must be a function. Plain object usage is no longer supported."
    );
    const L = o.call(n, n);
    if (process.env.NODE_ENV !== "production" && $s(L) && O(
      "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
    ), !W(L))
      process.env.NODE_ENV !== "production" && O("data() should return an object.");
    else if (e.data = /* @__PURE__ */ bt(L), process.env.NODE_ENV !== "production")
      for (const H in L)
        it("Data", H), Gs(H[0]) || Object.defineProperty(s, H, {
          configurable: !0,
          enumerable: !0,
          get: () => L[H],
          set: ce
        });
  }
  if (Ns = !0, r)
    for (const L in r) {
      const H = r[L], je = I(H) ? H.bind(n, n) : I(H.get) ? H.get.bind(n, n) : ce;
      process.env.NODE_ENV !== "production" && je === ce && O(`Computed property "${L}" has no getter.`);
      const Qn = !I(H) && I(H.set) ? H.set.bind(n) : process.env.NODE_ENV !== "production" ? () => {
        O(
          `Write operation failed: computed property "${L}" is readonly.`
        );
      } : ce, kt = Kc({
        get: je,
        set: Qn
      });
      Object.defineProperty(s, L, {
        enumerable: !0,
        configurable: !0,
        get: () => kt.value,
        set: (Nt) => kt.value = Nt
      }), process.env.NODE_ENV !== "production" && it("Computed", L);
    }
  if (l)
    for (const L in l)
      Fr(l[L], s, n, L);
  if (u) {
    const L = I(u) ? u.call(n) : u;
    Reflect.ownKeys(L).forEach((H) => {
      Vl(H, L[H]);
    });
  }
  d && yo(d, e, "c");
  function ye(L, H) {
    A(H) ? H.forEach((je) => L(je.bind(n))) : H && L(H.bind(n));
  }
  if (ye(Il, a), ye(dn, g), ye(Rl, b), ye(kl, M), ye(Al, C), ye(Pl, Q), ye(Ul, ne), ye(Ll, w), ye(Hl, ee), ye(jl, K), ye(qs, he), ye(Fl, T), A(be))
    if (be.length) {
      const L = e.exposed || (e.exposed = {});
      be.forEach((H) => {
        Object.defineProperty(L, H, {
          get: () => n[H],
          set: (je) => n[H] = je,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  x && e.render === ce && (e.render = x), rt != null && (e.inheritAttrs = rt), Se && (e.components = Se), vn && (e.directives = vn), T && Ir(e);
}
function Yl(e, t, n = ce) {
  A(e) && (e = Os(e));
  for (const s in e) {
    const o = e[s];
    let r;
    W(o) ? "default" in o ? r = Dn(
      o.from || s,
      o.default,
      !0
    ) : r = Dn(o.from || s) : r = Dn(o), /* @__PURE__ */ oe(r) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => r.value,
      set: (i) => r.value = i
    }) : t[s] = r, process.env.NODE_ENV !== "production" && n("Inject", s);
  }
}
function yo(e, t, n) {
  ke(
    A(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Fr(e, t, n, s) {
  let o = s.includes(".") ? Mr(n, s) : () => n[s];
  if (Z(e)) {
    const r = t[e];
    I(r) ? cs(o, r) : process.env.NODE_ENV !== "production" && O(`Invalid watch handler specified by key "${e}"`, r);
  } else if (I(e))
    cs(o, e.bind(n));
  else if (W(e))
    if (A(e))
      e.forEach((r) => Fr(r, t, n, s));
    else {
      const r = I(e.handler) ? e.handler.bind(n) : t[e.handler];
      I(r) ? cs(o, r, e) : process.env.NODE_ENV !== "production" && O(`Invalid watch handler specified by key "${e.handler}"`, r);
    }
  else process.env.NODE_ENV !== "production" && O(`Invalid watch option: "${s}"`, e);
}
function Hr(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: o,
    optionsCache: r,
    config: { optionMergeStrategies: i }
  } = e.appContext, l = r.get(t);
  let u;
  return l ? u = l : !o.length && !n && !s ? u = t : (u = {}, o.length && o.forEach(
    (p) => jn(u, p, i, !0)
  ), jn(u, t, i)), W(t) && r.set(t, u), u;
}
function jn(e, t, n, s = !1) {
  const { mixins: o, extends: r } = t;
  r && jn(e, r, n, !0), o && o.forEach(
    (i) => jn(e, i, n, !0)
  );
  for (const i in t)
    if (s && i === "expose")
      process.env.NODE_ENV !== "production" && O(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const l = zl[i] || n && n[i];
      e[i] = l ? l(e[i], t[i]) : t[i];
    }
  return e;
}
const zl = {
  data: No,
  props: Oo,
  emits: Oo,
  // objects
  methods: Wt,
  computed: Wt,
  // lifecycle
  beforeCreate: me,
  created: me,
  beforeMount: me,
  mounted: me,
  beforeUpdate: me,
  updated: me,
  beforeDestroy: me,
  beforeUnmount: me,
  destroyed: me,
  unmounted: me,
  activated: me,
  deactivated: me,
  errorCaptured: me,
  serverPrefetch: me,
  // assets
  components: Wt,
  directives: Wt,
  // watch
  watch: Zl,
  // provide / inject
  provide: No,
  inject: Xl
};
function No(e, t) {
  return t ? e ? function() {
    return re(
      I(e) ? e.call(this, this) : e,
      I(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Xl(e, t) {
  return Wt(Os(e), Os(t));
}
function Os(e) {
  if (A(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function me(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Wt(e, t) {
  return e ? re(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Oo(e, t) {
  return e ? A(e) && A(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : re(
    /* @__PURE__ */ Object.create(null),
    bo(e),
    bo(t ?? {})
  ) : t;
}
function Zl(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = re(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = me(e[s], t[s]);
  return n;
}
function Lr() {
  return {
    app: null,
    config: {
      isNativeTag: Zo,
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
let Ql = 0;
function ec(e, t) {
  return function(s, o = null) {
    I(s) || (s = re({}, s)), o != null && !W(o) && (process.env.NODE_ENV !== "production" && O("root props passed to app.mount() must be an object."), o = null);
    const r = Lr(), i = /* @__PURE__ */ new WeakSet(), l = [];
    let u = !1;
    const p = r.app = {
      _uid: Ql++,
      _component: s,
      _props: o,
      _container: null,
      _context: r,
      _instance: null,
      version: Io,
      get config() {
        return r.config;
      },
      set config(d) {
        process.env.NODE_ENV !== "production" && O(
          "app.config cannot be replaced. Modify individual options instead."
        );
      },
      use(d, ...a) {
        return i.has(d) ? process.env.NODE_ENV !== "production" && O("Plugin has already been applied to target app.") : d && I(d.install) ? (i.add(d), d.install(p, ...a)) : I(d) ? (i.add(d), d(p, ...a)) : process.env.NODE_ENV !== "production" && O(
          'A plugin must either be a function or an object with an "install" function.'
        ), p;
      },
      mixin(d) {
        return r.mixins.includes(d) ? process.env.NODE_ENV !== "production" && O(
          "Mixin has already been applied to target app" + (d.name ? `: ${d.name}` : "")
        ) : r.mixins.push(d), p;
      },
      component(d, a) {
        return process.env.NODE_ENV !== "production" && Ss(d, r.config), a ? (process.env.NODE_ENV !== "production" && r.components[d] && O(`Component "${d}" has already been registered in target app.`), r.components[d] = a, p) : r.components[d];
      },
      directive(d, a) {
        return process.env.NODE_ENV !== "production" && Ar(d), a ? (process.env.NODE_ENV !== "production" && r.directives[d] && O(`Directive "${d}" has already been registered in target app.`), r.directives[d] = a, p) : r.directives[d];
      },
      mount(d, a, g) {
        if (u)
          process.env.NODE_ENV !== "production" && O(
            "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
          );
        else {
          process.env.NODE_ENV !== "production" && d.__vue_app__ && O(
            "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
          );
          const b = p._ceVNode || Ee(s, o);
          return b.appContext = r, g === !0 ? g = "svg" : g === !1 && (g = void 0), process.env.NODE_ENV !== "production" && (r.reload = () => {
            const M = ft(b);
            M.el = null, e(M, d, g);
          }), e(b, d, g), u = !0, p._container = d, d.__vue_app__ = p, process.env.NODE_ENV !== "production" && (p._instance = b.component, vl(p, Io)), Zn(b.component);
        }
      },
      onUnmount(d) {
        process.env.NODE_ENV !== "production" && typeof d != "function" && O(
          `Expected function as first argument to app.onUnmount(), but got ${typeof d}`
        ), l.push(d);
      },
      unmount() {
        u ? (ke(
          l,
          p._instance,
          16
        ), e(null, p._container), process.env.NODE_ENV !== "production" && (p._instance = null, El(p)), delete p._container.__vue_app__) : process.env.NODE_ENV !== "production" && O("Cannot unmount an app that is not mounted.");
      },
      provide(d, a) {
        return process.env.NODE_ENV !== "production" && d in r.provides && (U(r.provides, d) ? O(
          `App already provides property with key "${String(d)}". It will be overwritten with the new value.`
        ) : O(
          `App already provides property with key "${String(d)}" inherited from its parent element. It will be overwritten with the new value.`
        )), r.provides[d] = a, p;
      },
      runWithContext(d) {
        const a = Pt;
        Pt = p;
        try {
          return d();
        } finally {
          Pt = a;
        }
      }
    };
    return p;
  };
}
let Pt = null;
const tc = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Oe(t)}Modifiers`] || e[`${at(t)}Modifiers`];
function nc(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || z;
  if (process.env.NODE_ENV !== "production") {
    const {
      emitsOptions: d,
      propsOptions: [a]
    } = e;
    if (d)
      if (!(t in d))
        (!a || !(ht(Oe(t)) in a)) && O(
          `Component emitted event "${t}" but it is neither declared in the emits option nor as an "${ht(Oe(t))}" prop.`
        );
      else {
        const g = d[t];
        I(g) && (g(...n) || O(
          `Invalid event arguments: event validation failed for event "${t}".`
        ));
      }
  }
  let o = n;
  const r = t.startsWith("update:"), i = r && tc(s, t.slice(7));
  if (i && (i.trim && (o = n.map((d) => Z(d) ? d.trim() : d)), i.number && (o = n.map(Ms))), process.env.NODE_ENV !== "production" && xl(e, t, o), process.env.NODE_ENV !== "production") {
    const d = t.toLowerCase();
    d !== t && s[ht(d)] && O(
      `Event "${d}" is emitted in component ${mn(
        e,
        e.type
      )} but the handler is registered for "${t}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${at(
        t
      )}" instead of "${t}".`
    );
  }
  let l, u = s[l = ht(t)] || // also try camelCase event handler (#2249)
  s[l = ht(Oe(t))];
  !u && r && (u = s[l = ht(at(t))]), u && ke(
    u,
    e,
    6,
    o
  );
  const p = s[l + "Once"];
  if (p) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, ke(
      p,
      e,
      6,
      o
    );
  }
}
const sc = /* @__PURE__ */ new WeakMap();
function Ur(e, t, n = !1) {
  const s = n ? sc : t.emitsCache, o = s.get(e);
  if (o !== void 0)
    return o;
  const r = e.emits;
  let i = {}, l = !1;
  if (!I(e)) {
    const u = (p) => {
      const d = Ur(p, t, !0);
      d && (l = !0, re(i, d));
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  return !r && !l ? (W(e) && s.set(e, null), null) : (A(r) ? r.forEach((u) => i[u] = null) : re(i, r), W(e) && s.set(e, i), i);
}
function Xn(e, t) {
  return !e || !ln(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), U(e, t[0].toLowerCase() + t.slice(1)) || U(e, at(t)) || U(e, t));
}
let ws = !1;
function Fn() {
  ws = !0;
}
function wo(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: o,
    propsOptions: [r],
    slots: i,
    attrs: l,
    emit: u,
    render: p,
    renderCache: d,
    props: a,
    data: g,
    setupState: b,
    ctx: M,
    inheritAttrs: C
  } = e, Q = Rn(e);
  let X, K;
  process.env.NODE_ENV !== "production" && (ws = !1);
  try {
    if (n.shapeFlag & 4) {
      const x = o || s, w = process.env.NODE_ENV !== "production" && b.__isScriptSetup ? new Proxy(x, {
        get(ee, ne, T) {
          return O(
            `Property '${String(
              ne
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          ), Reflect.get(ee, ne, T);
        }
      }) : x;
      X = Ce(
        p.call(
          w,
          x,
          d,
          process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(a) : a,
          b,
          g,
          M
        )
      ), K = l;
    } else {
      const x = t;
      process.env.NODE_ENV !== "production" && l === a && Fn(), X = Ce(
        x.length > 1 ? x(
          process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(a) : a,
          process.env.NODE_ENV !== "production" ? {
            get attrs() {
              return Fn(), /* @__PURE__ */ Ye(l);
            },
            slots: i,
            emit: u
          } : { attrs: l, slots: i, emit: u }
        ) : x(
          process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(a) : a,
          null
        )
      ), K = t.props ? l : oc(l);
    }
  } catch (x) {
    Xt.length = 0, an(x, e, 1), X = Ee(we);
  }
  let F = X, he;
  if (process.env.NODE_ENV !== "production" && X.patchFlag > 0 && X.patchFlag & 2048 && ([F, he] = Kr(X)), K && C !== !1) {
    const x = Object.keys(K), { shapeFlag: w } = F;
    if (x.length) {
      if (w & 7)
        r && x.some(en) && (K = rc(
          K,
          r
        )), F = ft(F, K, !1, !0);
      else if (process.env.NODE_ENV !== "production" && !ws && F.type !== we) {
        const ee = Object.keys(l), ne = [], T = [];
        for (let be = 0, rt = ee.length; be < rt; be++) {
          const Se = ee[be];
          ln(Se) ? en(Se) || ne.push(Se[2].toLowerCase() + Se.slice(3)) : T.push(Se);
        }
        T.length && O(
          `Extraneous non-props attributes (${T.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
        ), ne.length && O(
          `Extraneous non-emits event listeners (${ne.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
        );
      }
    }
  }
  return n.dirs && (process.env.NODE_ENV !== "production" && !xo(F) && O(
    "Runtime directive used on component with non-element root node. The directives will not function as intended."
  ), F = ft(F, null, !1, !0), F.dirs = F.dirs ? F.dirs.concat(n.dirs) : n.dirs), n.transition && (process.env.NODE_ENV !== "production" && !xo(F) && O(
    "Component inside <Transition> renders non-element root node that cannot be animated."
  ), Bs(F, n.transition)), process.env.NODE_ENV !== "production" && he ? he(F) : X = F, Rn(Q), X;
}
const Kr = (e) => {
  const t = e.children, n = e.dynamicChildren, s = Js(t, !1);
  if (s) {
    if (process.env.NODE_ENV !== "production" && s.patchFlag > 0 && s.patchFlag & 2048)
      return Kr(s);
  } else return [e, void 0];
  const o = t.indexOf(s), r = n ? n.indexOf(s) : -1, i = (l) => {
    t[o] = l, n && (r > -1 ? n[r] = l : l.patchFlag > 0 && (e.dynamicChildren = [...n, l]));
  };
  return [Ce(s), i];
};
function Js(e, t = !0) {
  let n;
  for (let s = 0; s < e.length; s++) {
    const o = e[s];
    if (hn(o)) {
      if (o.type !== we || o.children === "v-if") {
        if (n)
          return;
        if (n = o, process.env.NODE_ENV !== "production" && t && n.patchFlag > 0 && n.patchFlag & 2048)
          return Js(n.children);
      }
    } else
      return;
  }
  return n;
}
const oc = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || ln(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, rc = (e, t) => {
  const n = {};
  for (const s in e)
    (!en(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
}, xo = (e) => e.shapeFlag & 7 || e.type === we;
function ic(e, t, n) {
  const { props: s, children: o, component: r } = e, { props: i, children: l, patchFlag: u } = t, p = r.emitsOptions;
  if (process.env.NODE_ENV !== "production" && (o || l) && xe || t.dirs || t.transition)
    return !0;
  if (n && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return s ? Vo(s, i, p) : !!i;
    if (u & 8) {
      const d = t.dynamicProps;
      for (let a = 0; a < d.length; a++) {
        const g = d[a];
        if (Br(i, s, g) && !Xn(p, g))
          return !0;
      }
    }
  } else
    return (o || l) && (!l || !l.$stable) ? !0 : s === i ? !1 : s ? i ? Vo(s, i, p) : !0 : !!i;
  return !1;
}
function Vo(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let o = 0; o < s.length; o++) {
    const r = s[o];
    if (Br(t, e, r) && !Xn(n, r))
      return !0;
  }
  return !1;
}
function Br(e, t, n) {
  const s = e[n], o = t[n];
  return n === "style" && W(s) && W(o) ? !Is(s, o) : s !== o;
}
function lc({ vnode: e, parent: t, suspense: n }, s) {
  for (; t; ) {
    const o = t.subTree;
    if (o.suspense && o.suspense.activeBranch === e && (o.suspense.vnode.el = o.el = s, e = o), o === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
  n && n.activeBranch === e && (n.vnode.el = s);
}
const Wr = {}, qr = () => Object.create(Wr), Gr = (e) => Object.getPrototypeOf(e) === Wr;
function cc(e, t, n, s = !1) {
  const o = {}, r = qr();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Jr(e, t, o, r);
  for (const i in e.propsOptions[0])
    i in o || (o[i] = void 0);
  process.env.NODE_ENV !== "production" && zr(t || {}, o, e), n ? e.props = s ? o : /* @__PURE__ */ Xi(o) : e.type.props ? e.props = o : e.props = r, e.attrs = r;
}
function uc(e) {
  for (; e; ) {
    if (e.type.__hmrId) return !0;
    e = e.parent;
  }
}
function ac(e, t, n, s) {
  const {
    props: o,
    attrs: r,
    vnode: { patchFlag: i }
  } = e, l = /* @__PURE__ */ k(o), [u] = e.propsOptions;
  let p = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(process.env.NODE_ENV !== "production" && uc(e)) && (s || i > 0) && !(i & 16)
  ) {
    if (i & 8) {
      const d = e.vnode.dynamicProps;
      for (let a = 0; a < d.length; a++) {
        let g = d[a];
        if (Xn(e.emitsOptions, g))
          continue;
        const b = t[g];
        if (u)
          if (U(r, g))
            b !== r[g] && (r[g] = b, p = !0);
          else {
            const M = Oe(g);
            o[M] = xs(
              u,
              l,
              M,
              b,
              e,
              !1
            );
          }
        else
          b !== r[g] && (r[g] = b, p = !0);
      }
    }
  } else {
    Jr(e, t, o, r) && (p = !0);
    let d;
    for (const a in l)
      (!t || // for camelCase
      !U(t, a) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = at(a)) === a || !U(t, d))) && (u ? n && // for camelCase
      (n[a] !== void 0 || // for kebab-case
      n[d] !== void 0) && (o[a] = xs(
        u,
        l,
        a,
        void 0,
        e,
        !0
      )) : delete o[a]);
    if (r !== l)
      for (const a in r)
        (!t || !U(t, a)) && (delete r[a], p = !0);
  }
  p && Je(e.attrs, "set", ""), process.env.NODE_ENV !== "production" && zr(t || {}, o, e);
}
function Jr(e, t, n, s) {
  const [o, r] = e.propsOptions;
  let i = !1, l;
  if (t)
    for (let u in t) {
      if (Gt(u))
        continue;
      const p = t[u];
      let d;
      o && U(o, d = Oe(u)) ? !r || !r.includes(d) ? n[d] = p : (l || (l = {}))[d] = p : Xn(e.emitsOptions, u) || (!(u in s) || p !== s[u]) && (s[u] = p, i = !0);
    }
  if (r) {
    const u = /* @__PURE__ */ k(n), p = l || z;
    for (let d = 0; d < r.length; d++) {
      const a = r[d];
      n[a] = xs(
        o,
        u,
        a,
        p[a],
        e,
        !U(p, a)
      );
    }
  }
  return i;
}
function xs(e, t, n, s, o, r) {
  const i = e[n];
  if (i != null) {
    const l = U(i, "default");
    if (l && s === void 0) {
      const u = i.default;
      if (i.type !== Function && !i.skipFactory && I(u)) {
        const { propsDefaults: p } = o;
        if (n in p)
          s = p[n];
        else {
          const d = gn(o);
          s = p[n] = u.call(
            null,
            t
          ), d();
        }
      } else
        s = u;
      o.ce && o.ce._setProp(n, s);
    }
    i[
      0
      /* shouldCast */
    ] && (r && !l ? s = !1 : i[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === at(n)) && (s = !0));
  }
  return s;
}
const fc = /* @__PURE__ */ new WeakMap();
function Yr(e, t, n = !1) {
  const s = n ? fc : t.propsCache, o = s.get(e);
  if (o)
    return o;
  const r = e.props, i = {}, l = [];
  let u = !1;
  if (!I(e)) {
    const d = (a) => {
      u = !0;
      const [g, b] = Yr(a, t, !0);
      re(i, g), b && l.push(...b);
    };
    !n && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d);
  }
  if (!r && !u)
    return W(e) && s.set(e, Tt), Tt;
  if (A(r))
    for (let d = 0; d < r.length; d++) {
      process.env.NODE_ENV !== "production" && !Z(r[d]) && O("props must be strings when using array syntax.", r[d]);
      const a = Oe(r[d]);
      Do(a) && (i[a] = z);
    }
  else if (r) {
    process.env.NODE_ENV !== "production" && !W(r) && O("invalid props options", r);
    for (const d in r) {
      const a = Oe(d);
      if (Do(a)) {
        const g = r[d], b = i[a] = A(g) || I(g) ? { type: g } : re({}, g), M = b.type;
        let C = !1, Q = !0;
        if (A(M))
          for (let X = 0; X < M.length; ++X) {
            const K = M[X], F = I(K) && K.name;
            if (F === "Boolean") {
              C = !0;
              break;
            } else F === "String" && (Q = !1);
          }
        else
          C = I(M) && M.name === "Boolean";
        b[
          0
          /* shouldCast */
        ] = C, b[
          1
          /* shouldCastTrue */
        ] = Q, (C || U(b, "default")) && l.push(a);
      }
    }
  }
  const p = [i, l];
  return W(e) && s.set(e, p), p;
}
function Do(e) {
  return e[0] !== "$" && !Gt(e) ? !0 : (process.env.NODE_ENV !== "production" && O(`Invalid prop name: "${e}" is a reserved property.`), !1);
}
function dc(e) {
  return e === null ? "null" : typeof e == "function" ? e.name || "" : typeof e == "object" && e.constructor && e.constructor.name || "";
}
function zr(e, t, n) {
  const s = /* @__PURE__ */ k(t), o = n.propsOptions[0], r = Object.keys(e).map((i) => Oe(i));
  for (const i in o) {
    let l = o[i];
    l != null && pc(
      i,
      s[i],
      l,
      process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(s) : s,
      !r.includes(i)
    );
  }
}
function pc(e, t, n, s, o) {
  const { type: r, required: i, validator: l, skipCheck: u } = n;
  if (i && o) {
    O('Missing required prop: "' + e + '"');
    return;
  }
  if (!(t == null && !i)) {
    if (r != null && r !== !0 && !u) {
      let p = !1;
      const d = A(r) ? r : [r], a = [];
      for (let g = 0; g < d.length && !p; g++) {
        const { valid: b, expectedType: M } = gc(t, d[g]);
        a.push(M || ""), p = b;
      }
      if (!p) {
        O(mc(e, t, a));
        return;
      }
    }
    l && !l(t, s) && O('Invalid prop: custom validator check failed for prop "' + e + '".');
  }
}
const hc = /* @__PURE__ */ st(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function gc(e, t) {
  let n;
  const s = dc(t);
  if (s === "null")
    n = e === null;
  else if (hc(s)) {
    const o = typeof e;
    n = o === s.toLowerCase(), !n && o === "object" && (n = e instanceof t);
  } else s === "Object" ? n = W(e) : s === "Array" ? n = A(e) : n = e instanceof t;
  return {
    valid: n,
    expectedType: s
  };
}
function mc(e, t, n) {
  if (n.length === 0)
    return `Prop type [] for prop "${e}" won't match anything. Did you mean to use type Array instead?`;
  let s = `Invalid prop: type check failed for prop "${e}". Expected ${n.map(Kn).join(" | ")}`;
  const o = n[0], r = As(t), i = So(t, o), l = So(t, r);
  return n.length === 1 && Co(o) && _c(o, r) && (s += ` with value ${i}`), s += `, got ${r} `, Co(r) && (s += `with value ${l}.`), s;
}
function So(e, t) {
  return De(e) ? e.toString() : t === "String" ? `"${e}"` : t === "Number" ? `${Number(e)}` : `${e}`;
}
function Co(e) {
  return ["string", "number", "boolean"].some((n) => e.toLowerCase() === n);
}
function _c(...e) {
  return e.every((t) => {
    const n = t.toLowerCase();
    return n !== "boolean" && n !== "symbol";
  });
}
const Ys = (e) => e === "_" || e === "_ctx" || e === "$stable", zs = (e) => A(e) ? e.map(Ce) : [Ce(e)], vc = (e, t, n) => {
  if (t._n)
    return t;
  const s = Yn((...o) => (process.env.NODE_ENV !== "production" && ie && !(n === null && ue) && !(n && n.root !== ie.root) && O(
    `Slot "${e}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
  ), zs(t(...o))), n);
  return s._c = !1, s;
}, Xr = (e, t, n) => {
  const s = e._ctx;
  for (const o in e) {
    if (Ys(o)) continue;
    const r = e[o];
    if (I(r))
      t[o] = vc(o, r, s);
    else if (r != null) {
      process.env.NODE_ENV !== "production" && O(
        `Non-function value encountered for slot "${o}". Prefer function slots for better performance.`
      );
      const i = zs(r);
      t[o] = () => i;
    }
  }
}, Zr = (e, t) => {
  process.env.NODE_ENV !== "production" && !Ws(e.vnode) && O(
    "Non-function value encountered for default slot. Prefer function slots for better performance."
  );
  const n = zs(t);
  e.slots.default = () => n;
}, Vs = (e, t, n) => {
  for (const s in t)
    (n || !Ys(s)) && (e[s] = t[s]);
}, Ec = (e, t, n) => {
  const s = e.slots = qr();
  if (e.vnode.shapeFlag & 32) {
    const o = t._;
    o ? (Vs(s, t, n), n && $n(s, "_", o, !0)) : Xr(t, s);
  } else t && Zr(e, t);
}, bc = (e, t, n) => {
  const { vnode: s, slots: o } = e;
  let r = !0, i = z;
  if (s.shapeFlag & 32) {
    const l = t._;
    l ? process.env.NODE_ENV !== "production" && xe ? (Vs(o, t, n), Je(e, "set", "$slots")) : n && l === 1 ? r = !1 : Vs(o, t, n) : (r = !t.$stable, Xr(t, o)), i = t;
  } else t && (Zr(e, t), i = { default: 1 });
  if (r)
    for (const l in o)
      !Ys(l) && i[l] == null && delete o[l];
};
let Ut, Qe;
function wt(e, t) {
  e.appContext.config.performance && Hn() && Qe.mark(`vue-${t}-${e.uid}`), process.env.NODE_ENV !== "production" && Ol(e, t, Hn() ? Qe.now() : Date.now());
}
function xt(e, t) {
  if (e.appContext.config.performance && Hn()) {
    const n = `vue-${t}-${e.uid}`, s = n + ":end", o = `<${mn(e, e.type)}> ${t}`;
    Qe.mark(s), Qe.measure(o, n, s), Qe.clearMeasures(o), Qe.clearMarks(n), Qe.clearMarks(s);
  }
  process.env.NODE_ENV !== "production" && wl(e, t, Hn() ? Qe.now() : Date.now());
}
function Hn() {
  return Ut !== void 0 || (typeof window < "u" && window.performance ? (Ut = !0, Qe = window.performance) : Ut = !1), Ut;
}
function yc() {
  const e = [];
  if (process.env.NODE_ENV !== "production" && e.length) {
    const t = e.length > 1;
    console.warn(
      `Feature flag${t ? "s" : ""} ${e.join(", ")} ${t ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
    );
  }
}
const Ne = Vc;
function Nc(e) {
  return Oc(e);
}
function Oc(e, t) {
  yc();
  const n = un();
  n.__VUE__ = !0, process.env.NODE_ENV !== "production" && Us(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
  const {
    insert: s,
    remove: o,
    patchProp: r,
    createElement: i,
    createText: l,
    createComment: u,
    setText: p,
    setElementText: d,
    parentNode: a,
    nextSibling: g,
    setScopeId: b = ce,
    insertStaticContent: M
  } = e, C = (c, f, h, E = null, _ = null, m = null, V = void 0, N = null, y = process.env.NODE_ENV !== "production" && xe ? !1 : !!f.dynamicChildren) => {
    if (c === f)
      return;
    c && !Kt(c, f) && (E = En(c), lt(c, _, m, !0), c = null), f.patchFlag === -2 && (y = !1, f.dynamicChildren = null);
    const { type: v, ref: P, shapeFlag: D } = f;
    switch (v) {
      case pn:
        Q(c, f, h, E);
        break;
      case we:
        X(c, f, h, E);
        break;
      case Cn:
        c == null ? K(f, h, E, V) : process.env.NODE_ENV !== "production" && F(c, f, h, V);
        break;
      case pe:
        vn(
          c,
          f,
          h,
          E,
          _,
          m,
          V,
          N,
          y
        );
        break;
      default:
        D & 1 ? w(
          c,
          f,
          h,
          E,
          _,
          m,
          V,
          N,
          y
        ) : D & 6 ? no(
          c,
          f,
          h,
          E,
          _,
          m,
          V,
          N,
          y
        ) : D & 64 || D & 128 ? v.process(
          c,
          f,
          h,
          E,
          _,
          m,
          V,
          N,
          y,
          Ft
        ) : process.env.NODE_ENV !== "production" && O("Invalid VNode type:", v, `(${typeof v})`);
    }
    P != null && _ ? zt(P, c && c.ref, m, f || c, !f) : P == null && c && c.ref != null && zt(c.ref, null, m, c, !0);
  }, Q = (c, f, h, E) => {
    if (c == null)
      s(
        f.el = l(f.children),
        h,
        E
      );
    else {
      const _ = f.el = c.el;
      f.children !== c.children && p(_, f.children);
    }
  }, X = (c, f, h, E) => {
    c == null ? s(
      f.el = u(f.children || ""),
      h,
      E
    ) : f.el = c.el;
  }, K = (c, f, h, E) => {
    [c.el, c.anchor] = M(
      c.children,
      f,
      h,
      E,
      c.el,
      c.anchor
    );
  }, F = (c, f, h, E) => {
    if (f.children !== c.children) {
      const _ = g(c.anchor);
      x(c), [f.el, f.anchor] = M(
        f.children,
        h,
        _,
        E
      );
    } else
      f.el = c.el, f.anchor = c.anchor;
  }, he = ({ el: c, anchor: f }, h, E) => {
    let _;
    for (; c && c !== f; )
      _ = g(c), s(c, h, E), c = _;
    s(f, h, E);
  }, x = ({ el: c, anchor: f }) => {
    let h;
    for (; c && c !== f; )
      h = g(c), o(c), c = h;
    o(f);
  }, w = (c, f, h, E, _, m, V, N, y) => {
    if (f.type === "svg" ? V = "svg" : f.type === "math" && (V = "mathml"), c == null)
      ee(
        f,
        h,
        E,
        _,
        m,
        V,
        N,
        y
      );
    else {
      const v = c.el && c.el._isVueCE ? c.el : null;
      try {
        v && v._beginPatch(), be(
          c,
          f,
          _,
          m,
          V,
          N,
          y
        );
      } finally {
        v && v._endPatch();
      }
    }
  }, ee = (c, f, h, E, _, m, V, N) => {
    let y, v;
    const { props: P, shapeFlag: D, transition: $, dirs: R } = c;
    if (y = c.el = i(
      c.type,
      m,
      P && P.is,
      P
    ), D & 8 ? d(y, c.children) : D & 16 && T(
      c.children,
      y,
      null,
      E,
      _,
      fs(c, m),
      V,
      N
    ), R && dt(c, null, E, "created"), ne(y, c, c.scopeId, V, E), P) {
      for (const J in P)
        J !== "value" && !Gt(J) && r(y, J, null, P[J], m, E);
      "value" in P && r(y, "value", null, P.value, m), (v = P.onVnodeBeforeMount) && Ue(v, E, c);
    }
    process.env.NODE_ENV !== "production" && ($n(y, "__vnode", c, !0), $n(y, "__vueParentComponent", E, !0)), R && dt(c, null, E, "beforeMount");
    const B = wc(_, $);
    if (B && $.beforeEnter(y), s(y, f, h), (v = P && P.onVnodeMounted) || B || R) {
      const J = process.env.NODE_ENV !== "production" && xe;
      Ne(() => {
        let q;
        process.env.NODE_ENV !== "production" && (q = ho(J));
        try {
          v && Ue(v, E, c), B && $.enter(y), R && dt(c, null, E, "mounted");
        } finally {
          process.env.NODE_ENV !== "production" && ho(q);
        }
      }, _);
    }
  }, ne = (c, f, h, E, _) => {
    if (h && b(c, h), E)
      for (let m = 0; m < E.length; m++)
        b(c, E[m]);
    if (_) {
      let m = _.subTree;
      if (process.env.NODE_ENV !== "production" && m.patchFlag > 0 && m.patchFlag & 2048 && (m = Js(m.children) || m), f === m || ti(m.type) && (m.ssContent === f || m.ssFallback === f)) {
        const V = _.vnode;
        ne(
          c,
          V,
          V.scopeId,
          V.slotScopeIds,
          _.parent
        );
      }
    }
  }, T = (c, f, h, E, _, m, V, N, y = 0) => {
    for (let v = y; v < c.length; v++) {
      const P = c[v] = N ? et(c[v]) : Ce(c[v]);
      C(
        null,
        P,
        f,
        h,
        E,
        _,
        m,
        V,
        N
      );
    }
  }, be = (c, f, h, E, _, m, V) => {
    const N = f.el = c.el;
    process.env.NODE_ENV !== "production" && (N.__vnode = f);
    let { patchFlag: y, dynamicChildren: v, dirs: P } = f;
    y |= c.patchFlag & 16;
    const D = c.props || z, $ = f.props || z;
    let R;
    if (h && pt(h, !1), (R = $.onVnodeBeforeUpdate) && Ue(R, h, f, c), P && dt(f, c, h, "beforeUpdate"), h && pt(h, !0), process.env.NODE_ENV !== "production" && xe && (y = 0, V = !1, v = null), (D.innerHTML && $.innerHTML == null || D.textContent && $.textContent == null) && d(N, ""), v ? (rt(
      c.dynamicChildren,
      v,
      N,
      h,
      E,
      fs(f, _),
      m
    ), process.env.NODE_ENV !== "production" && Sn(c, f)) : V || je(
      c,
      f,
      N,
      null,
      h,
      E,
      fs(f, _),
      m,
      !1
    ), y > 0) {
      if (y & 16)
        Se(N, D, $, h, _);
      else if (y & 2 && D.class !== $.class && r(N, "class", null, $.class, _), y & 4 && r(N, "style", D.style, $.style, _), y & 8) {
        const B = f.dynamicProps;
        for (let J = 0; J < B.length; J++) {
          const q = B[J], se = D[q], ae = $[q];
          (ae !== se || q === "value") && r(N, q, se, ae, _, h);
        }
      }
      y & 1 && c.children !== f.children && d(N, f.children);
    } else !V && v == null && Se(N, D, $, h, _);
    ((R = $.onVnodeUpdated) || P) && Ne(() => {
      R && Ue(R, h, f, c), P && dt(f, c, h, "updated");
    }, E);
  }, rt = (c, f, h, E, _, m, V) => {
    for (let N = 0; N < f.length; N++) {
      const y = c[N], v = f[N], P = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        y.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (y.type === pe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Kt(y, v) || // - In the case of a component, it could contain anything.
        y.shapeFlag & 198) ? a(y.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      C(
        y,
        v,
        P,
        null,
        E,
        _,
        m,
        V,
        !0
      );
    }
  }, Se = (c, f, h, E, _) => {
    if (f !== h) {
      if (f !== z)
        for (const m in f)
          !Gt(m) && !(m in h) && r(
            c,
            m,
            f[m],
            null,
            _,
            E
          );
      for (const m in h) {
        if (Gt(m)) continue;
        const V = h[m], N = f[m];
        V !== N && m !== "value" && r(c, m, N, V, _, E);
      }
      "value" in h && r(c, "value", f.value, h.value, _);
    }
  }, vn = (c, f, h, E, _, m, V, N, y) => {
    const v = f.el = c ? c.el : l(""), P = f.anchor = c ? c.anchor : l("");
    let { patchFlag: D, dynamicChildren: $, slotScopeIds: R } = f;
    process.env.NODE_ENV !== "production" && // #5523 dev root fragment may inherit directives
    (xe || D & 2048) && (D = 0, y = !1, $ = null), R && (N = N ? N.concat(R) : R), c == null ? (s(v, h, E), s(P, h, E), T(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      f.children || [],
      h,
      P,
      _,
      m,
      V,
      N,
      y
    )) : D > 0 && D & 64 && $ && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    c.dynamicChildren && c.dynamicChildren.length === $.length ? (rt(
      c.dynamicChildren,
      $,
      h,
      _,
      m,
      V,
      N
    ), process.env.NODE_ENV !== "production" ? Sn(c, f) : (
      // #2080 if the stable fragment has a key, it's a <template v-for> that may
      //  get moved around. Make sure all root level vnodes inherit el.
      // #2134 or if it's a component root, it may also get moved around
      // as the component is being moved.
      (f.key != null || _ && f === _.subTree) && Sn(
        c,
        f,
        !0
        /* shallow */
      )
    )) : je(
      c,
      f,
      h,
      P,
      _,
      m,
      V,
      N,
      y
    );
  }, no = (c, f, h, E, _, m, V, N, y) => {
    f.slotScopeIds = N, c == null ? f.shapeFlag & 512 ? _.ctx.activate(
      f,
      h,
      E,
      V,
      y
    ) : it(
      f,
      h,
      E,
      _,
      m,
      V,
      y
    ) : ye(c, f, y);
  }, it = (c, f, h, E, _, m, V) => {
    const N = c.component = Mc(
      c,
      E,
      _
    );
    if (process.env.NODE_ENV !== "production" && N.type.__hmrId && hl(N), process.env.NODE_ENV !== "production" && (wn(c), wt(N, "mount")), Ws(c) && (N.ctx.renderer = Ft), process.env.NODE_ENV !== "production" && wt(N, "init"), Rc(N, !1, V), process.env.NODE_ENV !== "production" && xt(N, "init"), process.env.NODE_ENV !== "production" && xe && (c.el = null), N.asyncDep) {
      if (_ && _.registerDep(N, L, V), !c.el) {
        const y = N.subTree = Ee(we);
        X(null, y, f, h), c.placeholder = y.el;
      }
    } else
      L(
        N,
        c,
        f,
        h,
        _,
        m,
        V
      );
    process.env.NODE_ENV !== "production" && (xn(), xt(N, "mount"));
  }, ye = (c, f, h) => {
    const E = f.component = c.component;
    if (ic(c, f, h))
      if (E.asyncDep && !E.asyncResolved) {
        process.env.NODE_ENV !== "production" && wn(f), H(E, f, h), process.env.NODE_ENV !== "production" && xn();
        return;
      } else
        E.next = f, E.update();
    else
      f.el = c.el, E.vnode = f;
  }, L = (c, f, h, E, _, m, V) => {
    const N = () => {
      if (c.isMounted) {
        let { next: D, bu: $, u: R, parent: B, vnode: J } = c;
        {
          const He = Qr(c);
          if (He) {
            D && (D.el = J.el, H(c, D, V)), He.asyncDep.then(() => {
              Ne(() => {
                c.isUnmounted || v();
              }, _);
            });
            return;
          }
        }
        let q = D, se;
        process.env.NODE_ENV !== "production" && wn(D || c.vnode), pt(c, !1), D ? (D.el = J.el, H(c, D, V)) : D = J, $ && Vt($), (se = D.props && D.props.onVnodeBeforeUpdate) && Ue(se, B, D, J), pt(c, !0), process.env.NODE_ENV !== "production" && wt(c, "render");
        const ae = wo(c);
        process.env.NODE_ENV !== "production" && xt(c, "render");
        const Fe = c.subTree;
        c.subTree = ae, process.env.NODE_ENV !== "production" && wt(c, "patch"), C(
          Fe,
          ae,
          // parent may have changed if it's in a teleport
          a(Fe.el),
          // anchor may have changed if it's in a fragment
          En(Fe),
          c,
          _,
          m
        ), process.env.NODE_ENV !== "production" && xt(c, "patch"), D.el = ae.el, q === null && lc(c, ae.el), R && Ne(R, _), (se = D.props && D.props.onVnodeUpdated) && Ne(
          () => Ue(se, B, D, J),
          _
        ), process.env.NODE_ENV !== "production" && Cr(c), process.env.NODE_ENV !== "production" && xn();
      } else {
        let D;
        const { el: $, props: R } = f, { bm: B, m: J, parent: q, root: se, type: ae } = c, Fe = At(f);
        pt(c, !1), B && Vt(B), !Fe && (D = R && R.onVnodeBeforeMount) && Ue(D, q, f), pt(c, !0);
        {
          se.ce && se.ce._hasShadowRoot() && se.ce._injectChildStyle(
            ae,
            c.parent ? c.parent.type : void 0
          ), process.env.NODE_ENV !== "production" && wt(c, "render");
          const He = c.subTree = wo(c);
          process.env.NODE_ENV !== "production" && xt(c, "render"), process.env.NODE_ENV !== "production" && wt(c, "patch"), C(
            null,
            He,
            h,
            E,
            c,
            _,
            m
          ), process.env.NODE_ENV !== "production" && xt(c, "patch"), f.el = He.el;
        }
        if (J && Ne(J, _), !Fe && (D = R && R.onVnodeMounted)) {
          const He = f;
          Ne(
            () => Ue(D, q, He),
            _
          );
        }
        (f.shapeFlag & 256 || q && At(q.vnode) && q.vnode.shapeFlag & 256) && c.a && Ne(c.a, _), c.isMounted = !0, process.env.NODE_ENV !== "production" && bl(c), f = h = E = null;
      }
    };
    c.scope.on();
    const y = c.effect = new rr(N);
    c.scope.off();
    const v = c.update = y.run.bind(y), P = c.job = y.runIfDirty.bind(y);
    P.i = c, P.id = c.uid, y.scheduler = () => Jn(P), pt(c, !0), process.env.NODE_ENV !== "production" && (y.onTrack = c.rtc ? (D) => Vt(c.rtc, D) : void 0, y.onTrigger = c.rtg ? (D) => Vt(c.rtg, D) : void 0), v();
  }, H = (c, f, h) => {
    f.component = c;
    const E = c.vnode.props;
    c.vnode = f, c.next = null, ac(c, f.props, E, h), bc(c, f.children, h), Pe(), po(c), Me();
  }, je = (c, f, h, E, _, m, V, N, y = !1) => {
    const v = c && c.children, P = c ? c.shapeFlag : 0, D = f.children, { patchFlag: $, shapeFlag: R } = f;
    if ($ > 0) {
      if ($ & 128) {
        kt(
          v,
          D,
          h,
          E,
          _,
          m,
          V,
          N,
          y
        );
        return;
      } else if ($ & 256) {
        Qn(
          v,
          D,
          h,
          E,
          _,
          m,
          V,
          N,
          y
        );
        return;
      }
    }
    R & 8 ? (P & 16 && jt(v, _, m), D !== v && d(h, D)) : P & 16 ? R & 16 ? kt(
      v,
      D,
      h,
      E,
      _,
      m,
      V,
      N,
      y
    ) : jt(v, _, m, !0) : (P & 8 && d(h, ""), R & 16 && T(
      D,
      h,
      E,
      _,
      m,
      V,
      N,
      y
    ));
  }, Qn = (c, f, h, E, _, m, V, N, y) => {
    c = c || Tt, f = f || Tt;
    const v = c.length, P = f.length, D = Math.min(v, P);
    let $;
    for ($ = 0; $ < D; $++) {
      const R = f[$] = y ? et(f[$]) : Ce(f[$]);
      C(
        c[$],
        R,
        h,
        null,
        _,
        m,
        V,
        N,
        y
      );
    }
    v > P ? jt(
      c,
      _,
      m,
      !0,
      !1,
      D
    ) : T(
      f,
      h,
      E,
      _,
      m,
      V,
      N,
      y,
      D
    );
  }, kt = (c, f, h, E, _, m, V, N, y) => {
    let v = 0;
    const P = f.length;
    let D = c.length - 1, $ = P - 1;
    for (; v <= D && v <= $; ) {
      const R = c[v], B = f[v] = y ? et(f[v]) : Ce(f[v]);
      if (Kt(R, B))
        C(
          R,
          B,
          h,
          null,
          _,
          m,
          V,
          N,
          y
        );
      else
        break;
      v++;
    }
    for (; v <= D && v <= $; ) {
      const R = c[D], B = f[$] = y ? et(f[$]) : Ce(f[$]);
      if (Kt(R, B))
        C(
          R,
          B,
          h,
          null,
          _,
          m,
          V,
          N,
          y
        );
      else
        break;
      D--, $--;
    }
    if (v > D) {
      if (v <= $) {
        const R = $ + 1, B = R < P ? f[R].el : E;
        for (; v <= $; )
          C(
            null,
            f[v] = y ? et(f[v]) : Ce(f[v]),
            h,
            B,
            _,
            m,
            V,
            N,
            y
          ), v++;
      }
    } else if (v > $)
      for (; v <= D; )
        lt(c[v], _, m, !0), v++;
    else {
      const R = v, B = v, J = /* @__PURE__ */ new Map();
      for (v = B; v <= $; v++) {
        const ge = f[v] = y ? et(f[v]) : Ce(f[v]);
        ge.key != null && (process.env.NODE_ENV !== "production" && J.has(ge.key) && O(
          "Duplicate keys found during update:",
          JSON.stringify(ge.key),
          "Make sure keys are unique."
        ), J.set(ge.key, v));
      }
      let q, se = 0;
      const ae = $ - B + 1;
      let Fe = !1, He = 0;
      const Ht = new Array(ae);
      for (v = 0; v < ae; v++) Ht[v] = 0;
      for (v = R; v <= D; v++) {
        const ge = c[v];
        if (se >= ae) {
          lt(ge, _, m, !0);
          continue;
        }
        let Le;
        if (ge.key != null)
          Le = J.get(ge.key);
        else
          for (q = B; q <= $; q++)
            if (Ht[q - B] === 0 && Kt(ge, f[q])) {
              Le = q;
              break;
            }
        Le === void 0 ? lt(ge, _, m, !0) : (Ht[Le - B] = v + 1, Le >= He ? He = Le : Fe = !0, C(
          ge,
          f[Le],
          h,
          null,
          _,
          m,
          V,
          N,
          y
        ), se++);
      }
      const oo = Fe ? xc(Ht) : Tt;
      for (q = oo.length - 1, v = ae - 1; v >= 0; v--) {
        const ge = B + v, Le = f[ge], ro = f[ge + 1], io = ge + 1 < P ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          ro.el || ei(ro)
        ) : E;
        Ht[v] === 0 ? C(
          null,
          Le,
          h,
          io,
          _,
          m,
          V,
          N,
          y
        ) : Fe && (q < 0 || v !== oo[q] ? Nt(Le, h, io, 2) : q--);
      }
    }
  }, Nt = (c, f, h, E, _ = null) => {
    const { el: m, type: V, transition: N, children: y, shapeFlag: v } = c;
    if (v & 6) {
      Nt(c.component.subTree, f, h, E);
      return;
    }
    if (v & 128) {
      c.suspense.move(f, h, E);
      return;
    }
    if (v & 64) {
      V.move(c, f, h, Ft);
      return;
    }
    if (V === pe) {
      s(m, f, h);
      for (let D = 0; D < y.length; D++)
        Nt(y[D], f, h, E);
      s(c.anchor, f, h);
      return;
    }
    if (V === Cn) {
      he(c, f, h);
      return;
    }
    if (E !== 2 && v & 1 && N)
      if (E === 0)
        N.persisted && !m[us] ? s(m, f, h) : (N.beforeEnter(m), s(m, f, h), Ne(() => N.enter(m), _));
      else {
        const { leave: D, delayLeave: $, afterLeave: R } = N, B = () => {
          c.ctx.isUnmounted ? o(m) : s(m, f, h);
        }, J = () => {
          const q = m._isLeaving || !!m[us];
          m._isLeaving && m[us](
            !0
            /* cancelled */
          ), N.persisted && !q ? B() : D(m, () => {
            B(), R && R();
          });
        };
        $ ? $(m, B, J) : J();
      }
    else
      s(m, f, h);
  }, lt = (c, f, h, E = !1, _ = !1) => {
    const {
      type: m,
      props: V,
      ref: N,
      children: y,
      dynamicChildren: v,
      shapeFlag: P,
      patchFlag: D,
      dirs: $,
      cacheIndex: R,
      memo: B
    } = c;
    if (D === -2 && (_ = !1), N != null && (Pe(), zt(N, null, h, c, !0), Me()), R != null && (f.renderCache[R] = void 0), P & 256) {
      f.ctx.deactivate(c);
      return;
    }
    const J = P & 1 && $, q = !At(c);
    let se;
    if (q && (se = V && V.onVnodeBeforeUnmount) && Ue(se, f, c), P & 6)
      hi(c.component, h, E);
    else {
      if (P & 128) {
        c.suspense.unmount(h, E);
        return;
      }
      J && dt(c, null, f, "beforeUnmount"), P & 64 ? c.type.remove(
        c,
        f,
        h,
        Ft,
        E
      ) : v && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !v.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (m !== pe || D > 0 && D & 64) ? jt(
        v,
        f,
        h,
        !1,
        !0
      ) : (m === pe && D & 384 || !_ && P & 16) && jt(y, f, h), E && es(c);
    }
    const ae = B != null && R == null;
    (q && (se = V && V.onVnodeUnmounted) || J || ae) && Ne(() => {
      se && Ue(se, f, c), J && dt(c, null, f, "unmounted"), ae && (c.el = null);
    }, h);
  }, es = (c) => {
    const { type: f, el: h, anchor: E, transition: _ } = c;
    if (f === pe) {
      process.env.NODE_ENV !== "production" && c.patchFlag > 0 && c.patchFlag & 2048 && _ && !_.persisted ? c.children.forEach((V) => {
        V.type === we ? o(V.el) : es(V);
      }) : pi(h, E);
      return;
    }
    if (f === Cn) {
      x(c);
      return;
    }
    const m = () => {
      o(h), _ && !_.persisted && _.afterLeave && _.afterLeave();
    };
    if (c.shapeFlag & 1 && _ && !_.persisted) {
      const { leave: V, delayLeave: N } = _, y = () => V(h, m);
      N ? N(c.el, m, y) : y();
    } else
      m();
  }, pi = (c, f) => {
    let h;
    for (; c !== f; )
      h = g(c), o(c), c = h;
    o(f);
  }, hi = (c, f, h) => {
    process.env.NODE_ENV !== "production" && c.type.__hmrId && gl(c);
    const { bum: E, scope: _, job: m, subTree: V, um: N, m: y, a: v } = c;
    To(y), To(v), E && Vt(E), _.stop(), m && (m.flags |= 8, lt(V, c, f, h)), N && Ne(N, f), Ne(() => {
      c.isUnmounted = !0;
    }, f), process.env.NODE_ENV !== "production" && Nl(c);
  }, jt = (c, f, h, E = !1, _ = !1, m = 0) => {
    for (let V = m; V < c.length; V++)
      lt(c[V], f, h, E, _);
  }, En = (c) => {
    if (c.shapeFlag & 6)
      return En(c.component.subTree);
    if (c.shapeFlag & 128)
      return c.suspense.next();
    const f = g(c.anchor || c.el), h = f && f[Tl];
    return h ? g(h) : f;
  };
  let ts = !1;
  const so = (c, f, h) => {
    let E;
    c == null ? f._vnode && (lt(f._vnode, null, null, !0), E = f._vnode.component) : C(
      f._vnode || null,
      c,
      f,
      null,
      null,
      null,
      h
    ), f._vnode = c, ts || (ts = !0, po(E), Vr(), ts = !1);
  }, Ft = {
    p: C,
    um: lt,
    m: Nt,
    r: es,
    mt: it,
    mc: T,
    pc: je,
    pbc: rt,
    n: En,
    o: e
  };
  return {
    render: so,
    hydrate: void 0,
    createApp: ec(so)
  };
}
function fs({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function pt({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function wc(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Sn(e, t, n = !1) {
  const s = e.children, o = t.children;
  if (A(s) && A(o))
    for (let r = 0; r < s.length; r++) {
      const i = s[r];
      let l = o[r];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = o[r] = et(o[r]), l.el = i.el), !n && l.patchFlag !== -2 && Sn(i, l)), l.type === pn && (l.patchFlag === -1 && (l = o[r] = et(l)), l.el = i.el), l.type === we && !l.el && (l.el = i.el), process.env.NODE_ENV !== "production" && l.el && (l.el.__vnode = l);
    }
}
function xc(e) {
  const t = e.slice(), n = [0];
  let s, o, r, i, l;
  const u = e.length;
  for (s = 0; s < u; s++) {
    const p = e[s];
    if (p !== 0) {
      if (o = n[n.length - 1], e[o] < p) {
        t[s] = o, n.push(s);
        continue;
      }
      for (r = 0, i = n.length - 1; r < i; )
        l = r + i >> 1, e[n[l]] < p ? r = l + 1 : i = l;
      p < e[n[r]] && (r > 0 && (t[s] = n[r - 1]), n[r] = s);
    }
  }
  for (r = n.length, i = n[r - 1]; r-- > 0; )
    n[r] = i, i = t[i];
  return n;
}
function Qr(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Qr(t);
}
function To(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function ei(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? ei(t.subTree) : null;
}
const ti = (e) => e.__isSuspense;
function Vc(e, t) {
  t && t.pendingBranch ? A(e) ? t.effects.push(...e) : t.effects.push(e) : xr(e);
}
const pe = /* @__PURE__ */ Symbol.for("v-fgt"), pn = /* @__PURE__ */ Symbol.for("v-txt"), we = /* @__PURE__ */ Symbol.for("v-cmt"), Cn = /* @__PURE__ */ Symbol.for("v-stc"), Xt = [];
let Ve = null;
function te(e = !1) {
  Xt.push(Ve = e ? null : []);
}
function Dc() {
  Xt.pop(), Ve = Xt[Xt.length - 1] || null;
}
let on = 1;
function $o(e, t = !1) {
  on += e, e < 0 && Ve && t && (Ve.hasOnce = !0);
}
function ni(e) {
  return e.dynamicChildren = on > 0 ? Ve || Tt : null, Dc(), on > 0 && Ve && Ve.push(e), e;
}
function de(e, t, n, s, o, r) {
  return ni(
    S(
      e,
      t,
      n,
      s,
      o,
      r,
      !0
    )
  );
}
function It(e, t, n, s, o) {
  return ni(
    Ee(
      e,
      t,
      n,
      s,
      o,
      !0
    )
  );
}
function hn(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Kt(e, t) {
  if (process.env.NODE_ENV !== "production" && t.shapeFlag & 6 && e.component) {
    const n = Vn.get(t.type);
    if (n && n.has(e.component))
      return e.shapeFlag &= -257, t.shapeFlag &= -513, !1;
  }
  return e.type === t.type && e.key === t.key;
}
const Sc = (...e) => oi(
  ...e
), si = ({ key: e }) => e ?? null, Tn = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Z(e) || /* @__PURE__ */ oe(e) || I(e) ? { i: ue, r: e, k: t, f: !!n } : e : null);
function S(e, t = null, n = null, s = 0, o = null, r = e === pe ? 0 : 1, i = !1, l = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && si(t),
    ref: t && Tn(t),
    scopeId: $r,
    slotScopeIds: null,
    children: n,
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
    shapeFlag: r,
    patchFlag: s,
    dynamicProps: o,
    dynamicChildren: null,
    appContext: null,
    ctx: ue
  };
  return l ? (Xs(u, n), r & 128 && e.normalize(u)) : n && (u.shapeFlag |= Z(n) ? 8 : 16), process.env.NODE_ENV !== "production" && u.key !== u.key && O("VNode created with invalid key (NaN). VNode type:", u.type), on > 0 && // avoid a block node from tracking itself
  !i && // has current parent block
  Ve && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || r & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && Ve.push(u), u;
}
const Ee = process.env.NODE_ENV !== "production" ? Sc : oi;
function oi(e, t = null, n = null, s = 0, o = null, r = !1) {
  if ((!e || e === Kl) && (process.env.NODE_ENV !== "production" && !e && O(`Invalid vnode type when creating vnode: ${e}.`), e = we), hn(e)) {
    const l = ft(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Xs(l, n), on > 0 && !r && Ve && (l.shapeFlag & 6 ? Ve[Ve.indexOf(e)] = l : Ve.push(l)), l.patchFlag = -2, l;
  }
  if (ai(e) && (e = e.__vccOpts), t) {
    t = Cc(t);
    let { class: l, style: u } = t;
    l && !Z(l) && (t.class = ze(l)), W(u) && (/* @__PURE__ */ An(u) && !A(u) && (u = re({}, u)), t.style = Bn(u));
  }
  const i = Z(e) ? 1 : ti(e) ? 128 : $l(e) ? 64 : W(e) ? 4 : I(e) ? 2 : 0;
  return process.env.NODE_ENV !== "production" && i & 4 && /* @__PURE__ */ An(e) && (e = /* @__PURE__ */ k(e), O(
    "Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
    `
Component that was made reactive: `,
    e
  )), S(
    e,
    t,
    n,
    s,
    o,
    i,
    r,
    !0
  );
}
function Cc(e) {
  return e ? /* @__PURE__ */ An(e) || Gr(e) ? re({}, e) : e : null;
}
function ft(e, t, n = !1, s = !1) {
  const { props: o, ref: r, patchFlag: i, children: l, transition: u } = e, p = t ? $c(o || {}, t) : o, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: p,
    key: p && si(p),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && r ? A(r) ? r.concat(Tn(t)) : [r, Tn(t)] : Tn(t)
    ) : r,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: process.env.NODE_ENV !== "production" && i === -1 && A(l) ? l.map(ri) : l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== pe ? i === -1 ? 16 : i | 16 : i,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: u,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && ft(e.ssContent),
    ssFallback: e.ssFallback && ft(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return u && s && Bs(
    d,
    u.clone(d)
  ), d;
}
function ri(e) {
  const t = ft(e);
  return A(e.children) && (t.children = e.children.map(ri)), t;
}
function Tc(e = " ", t = 0) {
  return Ee(pn, null, e, t);
}
function Zt(e = "", t = !1) {
  return t ? (te(), It(we, null, e)) : Ee(we, null, e);
}
function Ce(e) {
  return e == null || typeof e == "boolean" ? Ee(we) : A(e) ? Ee(
    pe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : hn(e) ? et(e) : Ee(pn, null, String(e));
}
function et(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ft(e);
}
function Xs(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (A(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const o = t.default;
      o && (o._c && (o._d = !1), Xs(e, o()), o._c && (o._d = !0));
      return;
    } else {
      n = 32;
      const o = t._;
      !o && !Gr(t) ? t._ctx = ue : o === 3 && ue && (ue.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else I(t) ? (t = { default: t, _ctx: ue }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Tc(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function $c(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const o in s)
      if (o === "class")
        t.class !== s.class && (t.class = ze([t.class, s.class]));
      else if (o === "style")
        t.style = Bn([t.style, s.style]);
      else if (ln(o)) {
        const r = t[o], i = s[o];
        i && r !== i && !(A(r) && r.includes(i)) ? t[o] = r ? [].concat(r, i) : i : i == null && r == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !en(o) && (t[o] = i);
      } else o !== "" && (t[o] = s[o]);
  }
  return t;
}
function Ue(e, t, n, s = null) {
  ke(e, t, 7, [
    n,
    s
  ]);
}
const Ac = Lr();
let Pc = 0;
function Mc(e, t, n) {
  const s = e.type, o = (t ? t.appContext : e.appContext) || Ac, r = {
    uid: Pc++,
    vnode: e,
    type: s,
    parent: t,
    appContext: o,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Ai(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(o.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Yr(s, o),
    emitsOptions: Ur(s, o),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: z,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: z,
    data: z,
    props: z,
    attrs: z,
    slots: z,
    refs: z,
    setupState: z,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
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
  return process.env.NODE_ENV !== "production" ? r.ctx = Bl(r) : r.ctx = { _: r }, r.root = t ? t.root : r, r.emit = nc.bind(null, r), e.ce && e.ce(r), r;
}
let ie = null;
const ii = () => ie || ue;
let Ln, Ds;
{
  const e = un(), t = (n, s) => {
    let o;
    return (o = e[n]) || (o = e[n] = []), o.push(s), (r) => {
      o.length > 1 ? o.forEach((i) => i(r)) : o[0](r);
    };
  };
  Ln = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => ie = n
  ), Ds = t(
    "__VUE_SSR_SETTERS__",
    (n) => rn = n
  );
}
const gn = (e) => {
  const t = ie;
  return Ln(e), e.scope.on(), () => {
    e.scope.off(), Ln(t);
  };
}, Ao = () => {
  ie && ie.scope.off(), Ln(null);
}, Ic = /* @__PURE__ */ st("slot,component");
function Ss(e, { isNativeTag: t }) {
  (Ic(e) || t(e)) && O(
    "Do not use built-in or reserved HTML elements as component id: " + e
  );
}
function li(e) {
  return e.vnode.shapeFlag & 4;
}
let rn = !1;
function Rc(e, t = !1, n = !1) {
  t && Ds(t);
  const { props: s, children: o } = e.vnode, r = li(e);
  cc(e, s, r, t), Ec(e, o, n || t);
  const i = r ? kc(e, t) : void 0;
  return t && Ds(!1), i;
}
function kc(e, t) {
  const n = e.type;
  if (process.env.NODE_ENV !== "production") {
    if (n.name && Ss(n.name, e.appContext.config), n.components) {
      const o = Object.keys(n.components);
      for (let r = 0; r < o.length; r++)
        Ss(o[r], e.appContext.config);
    }
    if (n.directives) {
      const o = Object.keys(n.directives);
      for (let r = 0; r < o.length; r++)
        Ar(o[r]);
    }
    n.compilerOptions && jc() && O(
      '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
    );
  }
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, jr), process.env.NODE_ENV !== "production" && Wl(e);
  const { setup: s } = n;
  if (s) {
    Pe();
    const o = e.setupContext = s.length > 1 ? Hc(e) : null, r = gn(e), i = Rt(
      s,
      e,
      0,
      [
        process.env.NODE_ENV !== "production" ? /* @__PURE__ */ Ye(e.props) : e.props,
        o
      ]
    ), l = $s(i);
    if (Me(), r(), (l || e.sp) && !At(e) && Ir(e), l) {
      if (i.then(Ao, Ao), t)
        return i.then((u) => {
          Po(e, u, t);
        }).catch((u) => {
          an(u, e, 0);
        });
      if (e.asyncDep = i, process.env.NODE_ENV !== "production" && !e.suspense) {
        const u = mn(e, n);
        O(
          `Component <${u}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
        );
      }
    } else
      Po(e, i, t);
  } else
    ci(e, t);
}
function Po(e, t, n) {
  I(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : W(t) ? (process.env.NODE_ENV !== "production" && hn(t) && O(
    "setup() should not return VNodes directly - return a render function instead."
  ), process.env.NODE_ENV !== "production" && (e.devtoolsRawSetupState = t), e.setupState = yr(t), process.env.NODE_ENV !== "production" && ql(e)) : process.env.NODE_ENV !== "production" && t !== void 0 && O(
    `setup() should return an object. Received: ${t === null ? "null" : typeof t}`
  ), ci(e, n);
}
const jc = () => !0;
function ci(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || ce);
  {
    const o = gn(e);
    Pe();
    try {
      Jl(e);
    } finally {
      Me(), o();
    }
  }
  process.env.NODE_ENV !== "production" && !s.render && e.render === ce && !t && (s.template ? O(
    'Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".'
  ) : O("Component is missing template or render function: ", s));
}
const Mo = process.env.NODE_ENV !== "production" ? {
  get(e, t) {
    return Fn(), le(e, "get", ""), e[t];
  },
  set() {
    return O("setupContext.attrs is readonly."), !1;
  },
  deleteProperty() {
    return O("setupContext.attrs is readonly."), !1;
  }
} : {
  get(e, t) {
    return le(e, "get", ""), e[t];
  }
};
function Fc(e) {
  return new Proxy(e.slots, {
    get(t, n) {
      return le(e, "get", "$slots"), t[n];
    }
  });
}
function Hc(e) {
  const t = (n) => {
    if (process.env.NODE_ENV !== "production" && (e.exposed && O("expose() should be called only once per setup()."), n != null)) {
      let s = typeof n;
      s === "object" && (A(n) ? s = "array" : /* @__PURE__ */ oe(n) && (s = "ref")), s !== "object" && O(
        `expose() should be passed a plain object, received ${s}.`
      );
    }
    e.exposed = n || {};
  };
  if (process.env.NODE_ENV !== "production") {
    let n, s;
    return Object.freeze({
      get attrs() {
        return n || (n = new Proxy(e.attrs, Mo));
      },
      get slots() {
        return s || (s = Fc(e));
      },
      get emit() {
        return (o, ...r) => e.emit(o, ...r);
      },
      expose: t
    });
  } else
    return {
      attrs: new Proxy(e.attrs, Mo),
      slots: e.slots,
      emit: e.emit,
      expose: t
    };
}
function Zn(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(yr(Zi(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Et)
        return Et[n](e);
    },
    has(t, n) {
      return n in t || n in Et;
    }
  })) : e.proxy;
}
const Lc = /(?:^|[-_])\w/g, Uc = (e) => e.replace(Lc, (t) => t.toUpperCase()).replace(/[-_]/g, "");
function ui(e, t = !0) {
  return I(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function mn(e, t, n = !1) {
  let s = ui(t);
  if (!s && t.__file) {
    const o = t.__file.match(/([^/\\]+)\.\w+$/);
    o && (s = o[1]);
  }
  if (!s && e) {
    const o = (r) => {
      for (const i in r)
        if (r[i] === t)
          return i;
    };
    s = o(e.components) || e.parent && o(
      e.parent.type.components
    ) || o(e.appContext.components);
  }
  return s ? Uc(s) : n ? "App" : "Anonymous";
}
function ai(e) {
  return I(e) && "__vccOpts" in e;
}
const Kc = (e, t) => {
  const n = /* @__PURE__ */ sl(e, t, rn);
  if (process.env.NODE_ENV !== "production") {
    const s = ii();
    s && s.appContext.config.warnRecursiveComputed && (n._warnRecursive = !0);
  }
  return n;
};
function Bc() {
  if (process.env.NODE_ENV === "production" || typeof window > "u")
    return;
  const e = { style: "color:#3ba776" }, t = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, s = { style: "color:#eb2f96" }, o = {
    __vue_custom_formatter: !0,
    header(a) {
      if (!W(a))
        return null;
      if (a.__isVue)
        return ["div", e, "VueInstance"];
      if (/* @__PURE__ */ oe(a)) {
        Pe();
        const g = a.value;
        return Me(), [
          "div",
          {},
          ["span", e, d(a)],
          "<",
          l(g),
          ">"
        ];
      } else {
        if (/* @__PURE__ */ ut(a))
          return [
            "div",
            {},
            ["span", e, /* @__PURE__ */ ve(a) ? "ShallowReactive" : "Reactive"],
            "<",
            l(a),
            `>${/* @__PURE__ */ Ie(a) ? " (readonly)" : ""}`
          ];
        if (/* @__PURE__ */ Ie(a))
          return [
            "div",
            {},
            ["span", e, /* @__PURE__ */ ve(a) ? "ShallowReadonly" : "Readonly"],
            "<",
            l(a),
            ">"
          ];
      }
      return null;
    },
    hasBody(a) {
      return a && a.__isVue;
    },
    body(a) {
      if (a && a.__isVue)
        return [
          "div",
          {},
          ...r(a.$)
        ];
    }
  };
  function r(a) {
    const g = [];
    a.type.props && a.props && g.push(i("props", /* @__PURE__ */ k(a.props))), a.setupState !== z && g.push(i("setup", a.setupState)), a.data !== z && g.push(i("data", /* @__PURE__ */ k(a.data)));
    const b = u(a, "computed");
    b && g.push(i("computed", b));
    const M = u(a, "inject");
    return M && g.push(i("injected", M)), g.push([
      "div",
      {},
      [
        "span",
        {
          style: s.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: a }]
    ]), g;
  }
  function i(a, g) {
    return g = re({}, g), Object.keys(g).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        a
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(g).map((b) => [
          "div",
          {},
          ["span", s, b + ": "],
          l(g[b], !1)
        ])
      ]
    ] : ["span", {}];
  }
  function l(a, g = !0) {
    return typeof a == "number" ? ["span", t, a] : typeof a == "string" ? ["span", n, JSON.stringify(a)] : typeof a == "boolean" ? ["span", s, a] : W(a) ? ["object", { object: g ? /* @__PURE__ */ k(a) : a }] : ["span", n, String(a)];
  }
  function u(a, g) {
    const b = a.type;
    if (I(b))
      return;
    const M = {};
    for (const C in a.ctx)
      p(b, C, g) && (M[C] = a.ctx[C]);
    return M;
  }
  function p(a, g, b) {
    const M = a[b];
    if (A(M) && M.includes(g) || W(M) && g in M || a.extends && p(a.extends, g, b) || a.mixins && a.mixins.some((C) => p(C, g, b)))
      return !0;
  }
  function d(a) {
    return /* @__PURE__ */ ve(a) ? "ShallowRef" : a.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(o) : window.devtoolsFormatters = [o];
}
const Io = "3.5.35", nt = process.env.NODE_ENV !== "production" ? O : ce;
process.env.NODE_ENV;
process.env.NODE_ENV;
/**
* @vue/runtime-dom v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Cs;
const Ro = typeof window < "u" && window.trustedTypes;
if (Ro)
  try {
    Cs = /* @__PURE__ */ Ro.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch (e) {
    process.env.NODE_ENV !== "production" && nt(`Error creating trusted types policy: ${e}`);
  }
const fi = Cs ? (e) => Cs.createHTML(e) : (e) => e, Wc = "http://www.w3.org/2000/svg", qc = "http://www.w3.org/1998/Math/MathML", Ze = typeof document < "u" ? document : null, ko = Ze && /* @__PURE__ */ Ze.createElement("template"), Gc = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const o = t === "svg" ? Ze.createElementNS(Wc, e) : t === "mathml" ? Ze.createElementNS(qc, e) : n ? Ze.createElement(e, { is: n }) : Ze.createElement(e);
    return e === "select" && s && s.multiple != null && o.setAttribute("multiple", s.multiple), o;
  },
  createText: (e) => Ze.createTextNode(e),
  createComment: (e) => Ze.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ze.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, s, o, r) {
    const i = n ? n.previousSibling : t.lastChild;
    if (o && (o === r || o.nextSibling))
      for (; t.insertBefore(o.cloneNode(!0), n), !(o === r || !(o = o.nextSibling)); )
        ;
    else {
      ko.innerHTML = fi(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const l = ko.content;
      if (s === "svg" || s === "mathml") {
        const u = l.firstChild;
        for (; u.firstChild; )
          l.appendChild(u.firstChild);
        l.removeChild(u);
      }
      t.insertBefore(l, n);
    }
    return [
      // first
      i ? i.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Jc = /* @__PURE__ */ Symbol("_vtc");
function Yc(e, t, n) {
  const s = e[Jc];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const jo = /* @__PURE__ */ Symbol("_vod"), zc = /* @__PURE__ */ Symbol("_vsh"), Xc = /* @__PURE__ */ Symbol(process.env.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : ""), Zc = /(?:^|;)\s*display\s*:/;
function Qc(e, t, n) {
  const s = e.style, o = Z(n);
  let r = !1;
  if (n && !o) {
    if (t)
      if (Z(t))
        for (const i of t.split(";")) {
          const l = i.slice(0, i.indexOf(":")).trim();
          n[l] == null && qt(s, l, "");
        }
      else
        for (const i in t)
          n[i] == null && qt(s, i, "");
    for (const i in n) {
      i === "display" && (r = !0);
      const l = n[i];
      l != null ? nu(
        e,
        i,
        !Z(t) && t ? t[i] : void 0,
        l
      ) || qt(s, i, l) : qt(s, i, "");
    }
  } else if (o) {
    if (t !== n) {
      const i = s[Xc];
      i && (n += ";" + i), s.cssText = n, r = Zc.test(n);
    }
  } else t && e.removeAttribute("style");
  jo in e && (e[jo] = r ? s.display : "", e[zc] && (s.display = "none"));
}
const eu = /[^\\];\s*$/, Fo = /\s*!important$/;
function qt(e, t, n) {
  if (A(n))
    n.forEach((s) => qt(e, t, s));
  else if (n == null && (n = ""), process.env.NODE_ENV !== "production" && eu.test(n) && nt(
    `Unexpected semicolon at the end of '${t}' style value: '${n}'`
  ), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = tu(e, t);
    Fo.test(n) ? e.setProperty(
      at(s),
      n.replace(Fo, ""),
      "important"
    ) : e[s] = n;
  }
}
const Ho = ["Webkit", "Moz", "ms"], ds = {};
function tu(e, t) {
  const n = ds[t];
  if (n)
    return n;
  let s = Oe(t);
  if (s !== "filter" && s in e)
    return ds[t] = s;
  s = Kn(s);
  for (let o = 0; o < Ho.length; o++) {
    const r = Ho[o] + s;
    if (r in e)
      return ds[t] = r;
  }
  return t;
}
function nu(e, t, n, s) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && Z(s) && n === s;
}
const Lo = "http://www.w3.org/1999/xlink";
function Uo(e, t, n, s, o, r = Ti(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Lo, t.slice(6, t.length)) : e.setAttributeNS(Lo, t, n) : n == null || r && !nr(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    r ? "" : De(n) ? String(n) : n
  );
}
function Ko(e, t, n, s, o) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? fi(n) : n);
    return;
  }
  const r = e.tagName;
  if (t === "value" && r !== "PROGRESS" && // custom elements may use _value internally
  !r.includes("-")) {
    const l = r === "OPTION" ? e.getAttribute("value") || "" : e.value, u = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== u || !("_value" in e)) && (e.value = u), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let i = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = nr(n) : n == null && l === "string" ? (n = "", i = !0) : l === "number" && (n = 0, i = !0);
  }
  try {
    e[t] = n;
  } catch (l) {
    process.env.NODE_ENV !== "production" && !i && nt(
      `Failed setting prop "${t}" on <${r.toLowerCase()}>: value ${n} is invalid.`,
      l
    );
  }
  i && e.removeAttribute(o || t);
}
function Ct(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function su(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Bo = /* @__PURE__ */ Symbol("_vei");
function ou(e, t, n, s, o = null) {
  const r = e[Bo] || (e[Bo] = {}), i = r[t];
  if (s && i)
    i.value = process.env.NODE_ENV !== "production" ? qo(s, t) : s;
  else {
    const [l, u] = ru(t);
    if (s) {
      const p = r[t] = cu(
        process.env.NODE_ENV !== "production" ? qo(s, t) : s,
        o
      );
      Ct(e, l, p, u);
    } else i && (su(e, l, i, u), r[t] = void 0);
  }
}
const Wo = /(?:Once|Passive|Capture)$/;
function ru(e) {
  let t;
  if (Wo.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Wo); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : at(e.slice(2)), t];
}
let ps = 0;
const iu = /* @__PURE__ */ Promise.resolve(), lu = () => ps || (iu.then(() => ps = 0), ps = Date.now());
function cu(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    const o = n.value;
    if (A(o)) {
      const r = s.stopImmediatePropagation;
      s.stopImmediatePropagation = () => {
        r.call(s), s._stopped = !0;
      };
      const i = o.slice(), l = [s];
      for (let u = 0; u < i.length && !s._stopped; u++) {
        const p = i[u];
        p && ke(
          p,
          t,
          5,
          l
        );
      }
    } else
      ke(
        o,
        t,
        5,
        [s]
      );
  };
  return n.value = e, n.attached = lu(), n;
}
function qo(e, t) {
  return I(e) || A(e) ? e : (nt(
    `Wrong type passed as event handler to ${t} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof e}.`
  ), ce);
}
const Go = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, uu = (e, t, n, s, o, r) => {
  const i = o === "svg";
  t === "class" ? Yc(e, s, i) : t === "style" ? Qc(e, n, s) : ln(t) ? en(t) || ou(e, t, n, s, r) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : au(e, t, s, i)) ? (Ko(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Uo(e, t, s, i, r, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (fu(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !Z(s))) ? Ko(e, Oe(t), s, r, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Uo(e, t, s, i));
};
function au(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Go(t) && I(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const o = e.tagName;
    if (o === "IMG" || o === "VIDEO" || o === "CANVAS" || o === "SOURCE")
      return !1;
  }
  return Go(t) && Z(n) ? !1 : t in e;
}
function fu(e, t) {
  const n = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!n)
    return !1;
  const s = Oe(t);
  return Array.isArray(n) ? n.some((o) => Oe(o) === s) : Object.keys(n).some((o) => Oe(o) === s);
}
const Jo = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return A(t) ? (n) => Vt(t, n) : t;
};
function du(e) {
  e.target.composing = !0;
}
function Yo(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const hs = /* @__PURE__ */ Symbol("_assign");
function zo(e, t, n) {
  return t && (e = e.trim()), n && (e = Ms(e)), e;
}
const We = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, o) {
    e[hs] = Jo(o);
    const r = s || o.props && o.props.type === "number";
    Ct(e, t ? "change" : "input", (i) => {
      i.target.composing || e[hs](zo(e.value, n, r));
    }), (n || r) && Ct(e, "change", () => {
      e.value = zo(e.value, n, r);
    }), t || (Ct(e, "compositionstart", du), Ct(e, "compositionend", Yo), Ct(e, "change", Yo));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: o, number: r } }, i) {
    if (e[hs] = Jo(i), e.composing) return;
    const l = (r || e.type === "number") && !/^0\d/.test(e.value) ? Ms(e.value) : e.value, u = t ?? "";
    if (l === u)
      return;
    const p = e.getRootNode();
    (p instanceof Document || p instanceof ShadowRoot) && p.activeElement === e && e.type !== "range" && (s && t === n || o && e.value.trim() === u) || (e.value = u);
  }
}, pu = ["ctrl", "shift", "alt", "meta"], hu = {
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
  exact: (e, t) => pu.some((n) => e[`${n}Key`] && !t.includes(n))
}, gu = (e, t) => {
  if (!e) return e;
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = ((o, ...r) => {
    for (let i = 0; i < t.length; i++) {
      const l = hu[t[i]];
      if (l && l(o, t)) return;
    }
    return e(o, ...r);
  }));
}, mu = /* @__PURE__ */ re({ patchProp: uu }, Gc);
let Xo;
function _u() {
  return Xo || (Xo = Nc(mu));
}
const di = ((...e) => {
  const t = _u().createApp(...e);
  process.env.NODE_ENV !== "production" && (Eu(t), bu(t));
  const { mount: n } = t;
  return t.mount = (s) => {
    const o = yu(s);
    if (!o) return;
    const r = t._component;
    !I(r) && !r.render && !r.template && (r.template = o.innerHTML), o.nodeType === 1 && (o.textContent = "");
    const i = n(o, !1, vu(o));
    return o instanceof Element && (o.removeAttribute("v-cloak"), o.setAttribute("data-v-app", "")), i;
  }, t;
});
function vu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Eu(e) {
  Object.defineProperty(e.config, "isNativeTag", {
    value: (t) => Vi(t) || Di(t) || Si(t),
    writable: !1
  });
}
function bu(e) {
  {
    const t = e.config.isCustomElement;
    Object.defineProperty(e.config, "isCustomElement", {
      get() {
        return t;
      },
      set() {
        nt(
          "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
        );
      }
    });
    const n = e.config.compilerOptions, s = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
    Object.defineProperty(e.config, "compilerOptions", {
      get() {
        return nt(s), n;
      },
      set() {
        nt(s);
      }
    });
  }
}
function yu(e) {
  if (Z(e)) {
    const t = document.querySelector(e);
    return process.env.NODE_ENV !== "production" && !t && nt(
      `Failed to mount app: mount target selector "${e}" returned null.`
    ), t;
  }
  return process.env.NODE_ENV !== "production" && window.ShadowRoot && e instanceof window.ShadowRoot && e.mode === "closed" && nt(
    'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
  ), e;
}
/**
* vue v3.5.35
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Nu() {
  Bc();
}
process.env.NODE_ENV !== "production" && Nu();
const Ou = "/moton_prompt_enhancer/api";
function Zs(e) {
  async function t(n, s, o = null) {
    const r = {
      method: n,
      headers: { "Content-Type": "application/json" }
    };
    o && (r.body = JSON.stringify(o));
    const l = await (await e.fetchApi(`${Ou}${s}`, r)).json();
    if (!l.success)
      throw new Error(l.error || "API request failed");
    return l.data;
  }
  return {
    get: (n) => t("GET", n),
    post: (n, s) => t("POST", n, s),
    put: (n, s) => t("PUT", n, s),
    del: (n) => t("DELETE", n)
  };
}
const wu = "promptcraft-lang";
let xu = "zh", Vu = {};
function Du(e, t) {
  let n = Vu[e];
  if (n === void 0)
    return e;
  if (t)
    for (const [s, o] of Object.entries(t))
      n = n.replace(new RegExp(`\\{${s}\\}`, "g"), o);
  return n;
}
function Su() {
  return xu;
}
function Cu(e) {
  e !== "zh" && e !== "en" || (localStorage.setItem(wu, e), window.dispatchEvent(new CustomEvent("promptcraft:lang-changed", { detail: { lang: e } })), location.reload());
}
function Qs() {
  return {
    t: Du,
    getLang: Su,
    setLang: Cu
  };
}
const _n = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, o] of t)
    n[s] = o;
  return n;
}, Tu = {
  key: 0,
  class: "pc-dialog-header"
}, $u = { class: "pc-dialog-title" }, Au = { class: "pc-dialog-body" }, Pu = {
  key: 1,
  class: "pc-dialog-footer"
}, Mu = {
  __name: "BaseDialog",
  props: {
    title: { type: String, default: "" },
    width: { type: String, default: "600px" },
    height: { type: String, default: "auto" },
    showClose: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t;
    function s(r) {
      r.target === r.currentTarget && n("close");
    }
    function o(r) {
      r.key === "Escape" && n("close");
    }
    return dn(() => {
      document.addEventListener("keydown", o);
    }), qs(() => {
      document.removeEventListener("keydown", o);
    }), (r, i) => (te(), de("div", {
      class: "pc-dialog-backdrop",
      onClick: s
    }, [
      S("div", {
        class: "pc-dialog",
        style: Bn({ maxWidth: e.width, maxHeight: e.height })
      }, [
        e.title || e.showClose ? (te(), de("div", Tu, [
          S("h3", $u, G(e.title), 1),
          e.showClose ? (te(), de("button", {
            key: 0,
            class: "pc-dialog-close",
            onClick: i[0] || (i[0] = (l) => n("close"))
          }, "×")) : Zt("", !0)
        ])) : Zt("", !0),
        S("div", Au, [
          Eo(r.$slots, "default", {}, void 0)
        ]),
        r.$slots.footer ? (te(), de("div", Pu, [
          Eo(r.$slots, "footer", {}, void 0)
        ])) : Zt("", !0)
      ], 4)
    ]));
  }
}, eo = /* @__PURE__ */ _n(Mu, [["__scopeId", "data-v-c18d1e90"]]), Iu = {
  key: 0,
  class: "pc-toggle-label"
}, Ru = {
  __name: "BaseToggle",
  props: {
    modelValue: { type: Boolean, default: !1 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, s = t;
    function o() {
      n.disabled || s("update:modelValue", !n.modelValue);
    }
    return (r, i) => (te(), de("label", {
      class: ze(["pc-toggle-wrap", { "pc-toggle-disabled": e.disabled }]),
      onClick: gu(o, ["prevent"])
    }, [
      e.label ? (te(), de("span", Iu, G(e.label), 1)) : Zt("", !0),
      S("span", {
        class: ze(["pc-toggle", { "pc-toggle-on": e.modelValue }])
      }, [...i[0] || (i[0] = [
        S("span", { class: "pc-toggle-thumb" }, null, -1)
      ])], 2)
    ], 2));
  }
}, Qt = /* @__PURE__ */ _n(Ru, [["__scopeId", "data-v-9274747c"]]), ku = { class: "lsc-cat-bar" }, ju = { class: "lsc-cat-item" }, Fu = { class: "lsc-cat-label" }, Hu = ["value"], Lu = ["value"], Uu = { class: "lsc-cat-item" }, Ku = ["value"], Bu = ["value"], Wu = { class: "lsc-body" }, qu = { class: "lsc-sidebar" }, Gu = { class: "lsc-service-list" }, Ju = ["onClick"], Yu = { class: "lsc-svc-card-name" }, zu = { class: "lsc-svc-card-url" }, Xu = { class: "lsc-svc-card-badges" }, Zu = { class: "lsc-detail" }, Qu = {
  key: 0,
  class: "lsc-detail-form"
}, ea = { class: "lsc-field" }, ta = { class: "lsc-field" }, na = { class: "lsc-field" }, sa = ["placeholder"], oa = { class: "lsc-field" }, ra = { class: "lsc-field-row" }, ia = { class: "lsc-field lsc-field-half" }, la = { class: "lsc-field lsc-field-half" }, ca = { class: "lsc-field-row" }, ua = { class: "lsc-field lsc-field-half" }, aa = { class: "lsc-field lsc-field-half" }, fa = { class: "lsc-field" }, da = ["placeholder"], pa = { class: "lsc-field-hint" }, ha = { class: "lsc-field" }, ga = { class: "lsc-field-hint lsc-field-hint-warning" }, ma = { class: "lsc-field-desc" }, _a = { class: "lsc-actions" }, va = {
  key: 1,
  class: "lsc-detail-placeholder"
}, Ea = {
  __name: "ServiceConfig",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, s = t, { t: o } = Qs(), r = Zs(n.comfyApi), i = /* @__PURE__ */ Dt([]), l = /* @__PURE__ */ Dt({}), u = /* @__PURE__ */ Dt(null), p = /* @__PURE__ */ bt({
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
    }), d = /* @__PURE__ */ Dt(!1), a = /* @__PURE__ */ bt({ message: "", isError: !1 }), g = /* @__PURE__ */ Dt(!1);
    async function b() {
      g.value = !0;
      try {
        const x = await r.get("/services");
        i.value = x.services, l.value = x.current;
      } catch (x) {
        console.error("[PromptCraft] Load services failed:", x);
      } finally {
        g.value = !1;
      }
    }
    async function M(x) {
      u.value = x, d.value = !1;
      const w = i.value.find((ee) => ee.id === x);
      w && Object.assign(p, {
        name: w.name || "",
        api_url: w.api_url || "",
        api_key: "",
        model: w.model || "",
        temperature: w.temperature ?? 0.7,
        max_tokens: w.max_tokens ?? 2e3,
        disable_thinking: w.disable_thinking !== !1,
        filter_thinking_output: w.filter_thinking_output !== !1,
        aggressive_thinking_control: w.aggressive_thinking_control === !0,
        custom_thinking_params: w.custom_thinking_params ? JSON.stringify(w.custom_thinking_params, null, 2) : ""
      });
    }
    async function C() {
      try {
        const x = await r.post("/services", { name: o("settings.new_service") });
        await b(), M(x.id);
      } catch (x) {
        console.error("[PromptCraft] Add service failed:", x);
      }
    }
    async function Q() {
      if (!u.value) return;
      const x = {};
      for (const w of [
        "name",
        "api_url",
        "model",
        "temperature",
        "max_tokens",
        "disable_thinking",
        "filter_thinking_output",
        "aggressive_thinking_control"
      ])
        x[w] = p[w];
      if (d.value && p.api_key && (x.api_key = p.api_key), p.custom_thinking_params.trim())
        try {
          x.custom_thinking_params = JSON.parse(p.custom_thinking_params);
        } catch {
          a.message = o("service_config.custom_thinking_params_invalid"), a.isError = !0;
          return;
        }
      try {
        await r.put(`/services/${u.value}`, x), a.message = o("service_config.status.saved"), a.isError = !1, await b();
      } catch (w) {
        a.message = o("service_config.status.save_failed", { error: w.message }), a.isError = !0;
      }
    }
    async function X() {
      if (u.value && confirm(o("service_config.confirm_delete")))
        try {
          await r.del(`/services/${u.value}`), u.value = null, await b();
        } catch {
          a.message = o("service_config.status.delete_failed"), a.isError = !0;
        }
    }
    async function K() {
      if (u.value) {
        a.message = o("service_config.testing"), a.isError = !1;
        try {
          const x = {};
          if (d.value && (x.config = { ...p }, !x.config.api_url)) {
            a.message = o("service_config.fill_endpoint"), a.isError = !0;
            return;
          }
          const w = await r.post(`/services/${u.value}/test`, x);
          a.message = o("service_config.connection_success", { name: (w == null ? void 0 : w.message) || "" }), a.isError = !1;
        } catch (x) {
          a.message = o("service_config.connection_failed", { name: x.message }), a.isError = !0;
        }
      }
    }
    async function F(x, w) {
      try {
        await r.put("/services/current", { category: x, service_id: w, model: "" }), l.value[x] = { service_id: w };
      } catch (ee) {
        console.error("[PromptCraft] Update category failed:", ee);
      }
    }
    function he(x) {
      var ee, ne;
      const w = [];
      return ((ee = l.value.enhance) == null ? void 0 : ee.service_id) === x.id && w.push({ text: o("service_config.badge.enhance"), class: "lsc-badge-amber" }), ((ne = l.value.agent) == null ? void 0 : ne.service_id) === x.id && w.push({ text: "Agent", class: "lsc-badge-copper" }), w;
    }
    return dn(b), (x, w) => (te(), It(eo, {
      title: j(o)("service_config.title"),
      width: "860px",
      onClose: w[13] || (w[13] = (ee) => s("close"))
    }, {
      default: Yn(() => {
        var ee, ne;
        return [
          S("div", ku, [
            S("div", ju, [
              S("span", Fu, G(j(o)("service_config.prompt_enhance")), 1),
              S("select", {
                class: "lsc-cat-select",
                value: ((ee = l.value.enhance) == null ? void 0 : ee.service_id) || "",
                onChange: w[0] || (w[0] = (T) => F("enhance", T.target.value))
              }, [
                (te(!0), de(pe, null, On(i.value, (T) => (te(), de("option", {
                  key: T.id,
                  value: T.id
                }, G(T.name), 9, Lu))), 128))
              ], 40, Hu)
            ]),
            S("div", Uu, [
              w[14] || (w[14] = S("span", { class: "lsc-cat-label" }, "AI Agent", -1)),
              S("select", {
                class: "lsc-cat-select",
                value: ((ne = l.value.agent) == null ? void 0 : ne.service_id) || "",
                onChange: w[1] || (w[1] = (T) => F("agent", T.target.value))
              }, [
                (te(!0), de(pe, null, On(i.value, (T) => (te(), de("option", {
                  key: T.id,
                  value: T.id
                }, G(T.name), 9, Bu))), 128))
              ], 40, Ku)
            ])
          ]),
          S("div", Wu, [
            S("div", qu, [
              S("div", Gu, [
                (te(!0), de(pe, null, On(i.value, (T) => (te(), de("div", {
                  key: T.id,
                  class: ze(["lsc-svc-card", { "lsc-selected": T.id === u.value }]),
                  onClick: (be) => M(T.id)
                }, [
                  S("div", Yu, G(T.name), 1),
                  S("div", zu, G(T.api_url || j(o)("settings.not_configured")), 1),
                  S("div", Xu, [
                    (te(!0), de(pe, null, On(he(T), (be) => (te(), de("span", {
                      key: be.text,
                      class: ze(["lsc-badge", be.class])
                    }, G(be.text), 3))), 128))
                  ])
                ], 10, Ju))), 128))
              ]),
              S("button", {
                class: "lsc-add-btn",
                onClick: C
              }, " + " + G(j(o)("settings.add_service")), 1)
            ]),
            S("div", Zu, [
              u.value ? (te(), de("div", Qu, [
                S("div", ea, [
                  S("label", null, G(j(o)("service_config.service_name")), 1),
                  Be(S("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": w[2] || (w[2] = (T) => p.name = T)
                  }, null, 512), [
                    [We, p.name]
                  ])
                ]),
                S("div", ta, [
                  S("label", null, G(j(o)("service_config.api_endpoint")), 1),
                  Be(S("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": w[3] || (w[3] = (T) => p.api_url = T),
                    placeholder: "https://api.example.com/v1/chat/completions"
                  }, null, 512), [
                    [We, p.api_url]
                  ])
                ]),
                S("div", na, [
                  w[15] || (w[15] = S("label", null, "API Key", -1)),
                  Be(S("input", {
                    class: "lsc-input",
                    type: "password",
                    "onUpdate:modelValue": w[4] || (w[4] = (T) => p.api_key = T),
                    onInput: w[5] || (w[5] = (T) => d.value = !0),
                    placeholder: j(o)("service_config.api_key_placeholder")
                  }, null, 40, sa), [
                    [We, p.api_key]
                  ])
                ]),
                S("div", oa, [
                  S("label", null, G(j(o)("service_config.model_name")), 1),
                  Be(S("input", {
                    class: "lsc-input",
                    "onUpdate:modelValue": w[6] || (w[6] = (T) => p.model = T),
                    placeholder: "gpt-4o-mini / deepseek-chat"
                  }, null, 512), [
                    [We, p.model]
                  ])
                ]),
                S("div", ra, [
                  S("div", ia, [
                    w[16] || (w[16] = S("label", null, "Temperature", -1)),
                    Be(S("input", {
                      class: "lsc-input",
                      type: "number",
                      step: "0.05",
                      min: "0",
                      max: "2",
                      "onUpdate:modelValue": w[7] || (w[7] = (T) => p.temperature = T)
                    }, null, 512), [
                      [
                        We,
                        p.temperature,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  S("div", la, [
                    w[17] || (w[17] = S("label", null, "Max Tokens", -1)),
                    Be(S("input", {
                      class: "lsc-input",
                      type: "number",
                      step: "50",
                      min: "50",
                      max: "4000",
                      "onUpdate:modelValue": w[8] || (w[8] = (T) => p.max_tokens = T)
                    }, null, 512), [
                      [
                        We,
                        p.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                S("div", ca, [
                  S("div", ua, [
                    Ee(Qt, {
                      modelValue: p.disable_thinking,
                      "onUpdate:modelValue": w[9] || (w[9] = (T) => p.disable_thinking = T),
                      label: j(o)("service_config.disable_thinking")
                    }, null, 8, ["modelValue", "label"])
                  ]),
                  S("div", aa, [
                    Ee(Qt, {
                      modelValue: p.filter_thinking_output,
                      "onUpdate:modelValue": w[10] || (w[10] = (T) => p.filter_thinking_output = T),
                      label: j(o)("service_config.filter_thinking")
                    }, null, 8, ["modelValue", "label"])
                  ])
                ]),
                S("div", fa, [
                  S("label", null, G(j(o)("service_config.custom_thinking_params")), 1),
                  Be(S("textarea", {
                    class: "lsc-textarea",
                    "onUpdate:modelValue": w[11] || (w[11] = (T) => p.custom_thinking_params = T),
                    placeholder: j(o)("service_config.custom_thinking_params_placeholder")
                  }, null, 8, da), [
                    [We, p.custom_thinking_params]
                  ]),
                  S("div", pa, G(j(o)("service_config.custom_thinking_params_hint")), 1)
                ]),
                S("div", ha, [
                  Ee(Qt, {
                    modelValue: p.aggressive_thinking_control,
                    "onUpdate:modelValue": w[12] || (w[12] = (T) => p.aggressive_thinking_control = T),
                    label: j(o)("service_config.aggressive_thinking_control")
                  }, null, 8, ["modelValue", "label"]),
                  S("div", ga, G(j(o)("service_config.aggressive_thinking_control_hint")), 1),
                  S("div", ma, G(j(o)("service_config.aggressive_thinking_control_desc")), 1)
                ]),
                S("div", _a, [
                  S("button", {
                    class: "lsc-btn lsc-btn-primary",
                    onClick: K
                  }, " 🧪 " + G(j(o)("service_config.test_connection")), 1),
                  S("button", {
                    class: "lsc-btn lsc-btn-save",
                    onClick: Q
                  }, " 💾 " + G(j(o)("service_config.save")), 1),
                  S("button", {
                    class: "lsc-btn lsc-btn-danger",
                    onClick: X
                  }, G(j(o)("service_config.delete_service")), 1)
                ]),
                a.message ? (te(), de("div", {
                  key: 0,
                  class: ze(["lsc-status", a.isError ? "lsc-status-error" : "lsc-status-ok"])
                }, G(a.message), 3)) : Zt("", !0)
              ])) : (te(), de("div", va, G(j(o)("service_config.detail_placeholder")), 1))
            ])
          ])
        ];
      }),
      _: 1
    }, 8, ["title"]));
  }
}, ba = /* @__PURE__ */ _n(Ea, [["__scopeId", "data-v-e24ae119"]]), ya = { class: "mpe-negative-editor" }, Na = { class: "mpe-desc" }, Oa = { class: "mpe-content" }, wa = ["placeholder"], xa = { class: "mpe-footer" }, Va = {
  __name: "NegativePromptEditor",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, s = t, { t: o } = Qs(), r = Zs(n.comfyApi), i = /* @__PURE__ */ Dt(""), l = reactive({
      message: "",
      isError: !1
    });
    async function u() {
      l.message = o("negative_editor.status.loading"), l.isError = !1;
      try {
        const a = await r.get("/negative_prompt");
        i.value = (a == null ? void 0 : a.content) || "", l.message = o("negative_editor.status.loaded");
      } catch (a) {
        l.message = o("negative_editor.status.load_failed", { error: a.message }), l.isError = !0;
      }
    }
    async function p() {
      l.message = o("negative_editor.status.saving"), l.isError = !1;
      try {
        await r.post("/negative_prompt", { content: i.value }), l.message = o("negative_editor.status.saved");
      } catch (a) {
        l.message = o("negative_editor.status.save_failed", { error: a.message }), l.isError = !0;
      }
    }
    function d(a) {
      (a.ctrlKey || a.metaKey) && a.key === "s" && (a.preventDefault(), p());
    }
    return dn(u), (a, g) => (te(), It(eo, {
      title: j(o)("negative_editor.title"),
      width: "900px",
      onClose: g[2] || (g[2] = (b) => s("close"))
    }, {
      default: Yn(() => [
        S("div", ya, [
          S("p", Na, G(j(o)("negative_editor.desc")), 1),
          S("div", Oa, [
            Be(S("textarea", {
              "onUpdate:modelValue": g[0] || (g[0] = (b) => i.value = b),
              class: "mpe-textarea",
              placeholder: j(o)("negative_editor.placeholder"),
              onKeydown: d
            }, null, 40, wa), [
              [We, i.value]
            ])
          ]),
          S("div", xa, [
            S("span", {
              class: ze(["mpe-status", { "mpe-status-error": j(l).isError }])
            }, G(j(l).message), 3),
            S("button", {
              class: "mpe-btn mpe-btn-save",
              onClick: p
            }, G(j(o)("common.save")), 1),
            S("button", {
              class: "mpe-btn mpe-btn-close",
              onClick: g[1] || (g[1] = (b) => s("close"))
            }, G(j(o)("common.close")), 1)
          ])
        ])
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, Da = /* @__PURE__ */ _n(Va, [["__scopeId", "data-v-39f66b96"]]), Sa = { class: "mpe-rule-section" }, Ca = { class: "mpe-rule-header" }, Ta = { class: "mpe-rule-title" }, $a = ["placeholder"], Aa = { class: "mpe-rule-section" }, Pa = { class: "mpe-rule-header" }, Ma = { class: "mpe-rule-title" }, Ia = ["placeholder"], Ra = { class: "mpe-footer" }, ka = {
  __name: "RuleManager",
  props: {
    comfyApi: { type: Object, required: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, s = t, { t: o } = Qs(), r = Zs(n.comfyApi), i = /* @__PURE__ */ bt({
      sfw_rules: "",
      nsfw_rules: "",
      sfw_enabled: !0,
      nsfw_enabled: !0
    }), l = /* @__PURE__ */ bt({
      message: "",
      isError: !1
    });
    async function u() {
      l.message = o("rule_manager.status.loading"), l.isError = !1;
      try {
        const a = await r.get("/system_prompt");
        Object.assign(i, {
          sfw_rules: (a == null ? void 0 : a.sfw_rules) || "",
          nsfw_rules: (a == null ? void 0 : a.nsfw_rules) || "",
          sfw_enabled: (a == null ? void 0 : a.sfw_enabled) !== !1,
          nsfw_enabled: (a == null ? void 0 : a.nsfw_enabled) !== !1
        }), l.message = o("rule_manager.status.loaded");
      } catch (a) {
        l.message = o("rule_manager.status.load_failed", { error: a.message }), l.isError = !0;
      }
    }
    async function p() {
      l.message = o("rule_manager.status.saving"), l.isError = !1;
      try {
        await r.post("/system_prompt", { ...i }), l.message = o("rule_manager.status.saved");
      } catch (a) {
        l.message = o("rule_manager.status.save_failed", { error: a.message }), l.isError = !0;
      }
    }
    function d(a) {
      (a.ctrlKey || a.metaKey) && a.key === "s" && (a.preventDefault(), p());
    }
    return dn(u), (a, g) => (te(), It(eo, {
      title: j(o)("rule_manager.title"),
      width: "900px",
      onClose: g[5] || (g[5] = (b) => s("close"))
    }, {
      default: Yn(() => [
        S("div", {
          class: "mpe-rule-manager",
          onKeydown: d
        }, [
          S("div", Sa, [
            S("div", Ca, [
              S("span", Ta, G(j(o)("rule_manager.basic")), 1),
              Ee(Qt, {
                modelValue: i.sfw_enabled,
                "onUpdate:modelValue": g[0] || (g[0] = (b) => i.sfw_enabled = b),
                label: j(o)("rule_manager.enable")
              }, null, 8, ["modelValue", "label"])
            ]),
            Be(S("textarea", {
              "onUpdate:modelValue": g[1] || (g[1] = (b) => i.sfw_rules = b),
              class: "mpe-textarea",
              placeholder: j(o)("rule_manager.placeholder_basic")
            }, null, 8, $a), [
              [We, i.sfw_rules]
            ])
          ]),
          S("div", Aa, [
            S("div", Pa, [
              S("span", Ma, G(j(o)("rule_manager.detail")), 1),
              Ee(Qt, {
                modelValue: i.nsfw_enabled,
                "onUpdate:modelValue": g[2] || (g[2] = (b) => i.nsfw_enabled = b),
                label: j(o)("rule_manager.enable")
              }, null, 8, ["modelValue", "label"])
            ]),
            Be(S("textarea", {
              "onUpdate:modelValue": g[3] || (g[3] = (b) => i.nsfw_rules = b),
              class: "mpe-textarea",
              placeholder: j(o)("rule_manager.placeholder_detail")
            }, null, 8, Ia), [
              [We, i.nsfw_rules]
            ])
          ]),
          S("div", Ra, [
            S("span", {
              class: ze(["mpe-status", { "mpe-status-error": l.isError }])
            }, G(l.message), 3),
            S("button", {
              class: "mpe-btn mpe-btn-save",
              onClick: p
            }, G(j(o)("common.save")), 1),
            S("button", {
              class: "mpe-btn mpe-btn-close",
              onClick: g[4] || (g[4] = (b) => s("close"))
            }, G(j(o)("common.close")), 1)
          ])
        ], 32)
      ]),
      _: 1
    }, 8, ["title"]));
  }
}, ja = /* @__PURE__ */ _n(ka, [["__scopeId", "data-v-36646ccd"]]);
function Ka(e, t, n = {}) {
  const s = di(t, n);
  return { vm: s.mount(e), unmount: () => s.unmount() };
}
function to(e, t) {
  let n = null, s = null;
  return {
    open(o) {
      this.close(), s = document.createElement("div"), s.id = t, document.body.appendChild(s);
      const r = di(e, {
        comfyApi: o,
        onClose: () => this.close()
      });
      n = {
        unmount: () => {
          r.unmount(), s && (s.remove(), s = null);
        }
      }, r.mount(s);
    },
    close() {
      n && (n.unmount(), n = null);
    }
  };
}
const Fa = to(ba, "promptcraft-service-config"), Ha = to(Da, "promptcraft-negative-editor"), La = to(ja, "promptcraft-rule-manager");
function Ba(e) {
  Fa.open(e);
}
function Wa(e) {
  Ha.open(e);
}
function qa(e) {
  La.open(e);
}
export {
  Da as NegativePromptEditor,
  ja as RuleManager,
  ba as ServiceConfig,
  Ka as mountVueWidget,
  Ha as negativePromptModal,
  Wa as openNegativePromptEditor,
  qa as openRuleManager,
  Ba as openServiceConfigModal,
  La as ruleManagerModal,
  Fa as serviceConfigModal
};
