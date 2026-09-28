var U = "top", X = "bottom", Y = "right", P = "left", gt = "start", G = "end", vt = "beforeRead", yt = "read", bt = "afterRead", wt = "beforeMain", xt = "main", Et = "afterMain", Ct = "beforeWrite", $t = "write", Bt = "afterWrite", Tt = [vt, yt, bt, wt, xt, Et, Ct, $t, Bt];
function O(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function w(e) {
  if (e == null)
    return window;
  if (e.toString() !== "[object Window]") {
    var t = e.ownerDocument;
    return t && t.defaultView || window;
  }
  return e;
}
function J(e) {
  var t = w(e).Element;
  return e instanceof t || e instanceof Element;
}
function $(e) {
  var t = w(e).HTMLElement;
  return e instanceof t || e instanceof HTMLElement;
}
function lt(e) {
  if (typeof ShadowRoot > "u")
    return !1;
  var t = w(e).ShadowRoot;
  return e instanceof t || e instanceof ShadowRoot;
}
function Ot(e) {
  var t = e.state;
  Object.keys(t.elements).forEach(function(n) {
    var s = t.styles[n] || {}, o = t.attributes[n] || {}, i = t.elements[n];
    !$(i) || !O(i) || (Object.assign(i.style, s), Object.keys(o).forEach(function(u) {
      var l = o[u];
      l === !1 ? i.removeAttribute(u) : i.setAttribute(u, l === !0 ? "" : l);
    }));
  });
}
function Mt(e) {
  var t = e.state, n = {
    popper: {
      position: t.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  return Object.assign(t.elements.popper.style, n.popper), t.styles = n, t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow), function() {
    Object.keys(t.elements).forEach(function(s) {
      var o = t.elements[s], i = t.attributes[s] || {}, u = Object.keys(t.styles.hasOwnProperty(s) ? t.styles[s] : n[s]), l = u.reduce(function(r, d) {
        return r[d] = "", r;
      }, {});
      !$(o) || !O(o) || (Object.assign(o.style, l), Object.keys(i).forEach(function(r) {
        o.removeAttribute(r);
      }));
    });
  };
}
const Rt = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: Ot,
  effect: Mt,
  requires: ["computeStyles"]
};
function ct(e) {
  return e.split("-")[0];
}
var H = Math.round;
function Z() {
  var e = navigator.userAgentData;
  return e != null && e.brands && Array.isArray(e.brands) ? e.brands.map(function(t) {
    return t.brand + "/" + t.version;
  }).join(" ") : navigator.userAgent;
}
function Lt() {
  return !/^((?!chrome|android).)*safari/i.test(Z());
}
function F(e, t, n) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  var s = e.getBoundingClientRect(), o = 1, i = 1;
  t && $(e) && (o = e.offsetWidth > 0 && H(s.width) / e.offsetWidth || 1, i = e.offsetHeight > 0 && H(s.height) / e.offsetHeight || 1);
  var u = J(e) ? w(e) : window, l = u.visualViewport, r = !Lt() && n, d = (s.left + (r && l ? l.offsetLeft : 0)) / o, c = (s.top + (r && l ? l.offsetTop : 0)) / i, m = s.width / o, x = s.height / i;
  return {
    width: m,
    height: x,
    top: c,
    right: d + m,
    bottom: c + x,
    left: d,
    x: d,
    y: c
  };
}
function At(e) {
  var t = F(e), n = e.offsetWidth, s = e.offsetHeight;
  return Math.abs(t.width - n) <= 1 && (n = t.width), Math.abs(t.height - s) <= 1 && (s = t.height), {
    x: e.offsetLeft,
    y: e.offsetTop,
    width: n,
    height: s
  };
}
function R(e) {
  return w(e).getComputedStyle(e);
}
function Ht(e) {
  return ["table", "td", "th"].indexOf(O(e)) >= 0;
}
function W(e) {
  return ((J(e) ? e.ownerDocument : (
    // $FlowFixMe[prop-missing]
    e.document
  )) || window.document).documentElement;
}
function Q(e) {
  return O(e) === "html" ? e : (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    e.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    e.parentNode || // DOM Element detected
    (lt(e) ? e.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    W(e)
  );
}
function st(e) {
  return !$(e) || // https://github.com/popperjs/popper-core/issues/837
  R(e).position === "fixed" ? null : e.offsetParent;
}
function kt(e) {
  var t = /firefox/i.test(Z()), n = /Trident/i.test(Z());
  if (n && $(e)) {
    var s = R(e);
    if (s.position === "fixed")
      return null;
  }
  var o = Q(e);
  for (lt(o) && (o = o.host); $(o) && ["html", "body"].indexOf(O(o)) < 0; ) {
    var i = R(o);
    if (i.transform !== "none" || i.perspective !== "none" || i.contain === "paint" || ["transform", "perspective"].indexOf(i.willChange) !== -1 || t && i.willChange === "filter" || t && i.filter && i.filter !== "none")
      return o;
    o = o.parentNode;
  }
  return null;
}
function dt(e) {
  for (var t = w(e), n = st(e); n && Ht(n) && R(n).position === "static"; )
    n = st(n);
  return n && (O(n) === "html" || O(n) === "body" && R(n).position === "static") ? t : n || kt(e) || t;
}
function St(e) {
  return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
function ut(e) {
  return e.split("-")[1];
}
var _t = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function zt(e, t) {
  var n = e.x, s = e.y, o = t.devicePixelRatio || 1;
  return {
    x: H(n * o) / o || 0,
    y: H(s * o) / o || 0
  };
}
function ot(e) {
  var t, n = e.popper, s = e.popperRect, o = e.placement, i = e.variation, u = e.offsets, l = e.position, r = e.gpuAcceleration, d = e.adaptive, c = e.roundOffsets, m = e.isFixed, x = u.x, f = x === void 0 ? 0 : x, z = u.y, g = z === void 0 ? 0 : z, h = typeof c == "function" ? c({
    x: f,
    y: g
  }) : {
    x: f,
    y: g
  };
  f = h.x, g = h.y;
  var E = u.hasOwnProperty("x"), B = u.hasOwnProperty("y"), C = P, y = U, b = window;
  if (d) {
    var v = dt(n), L = "clientHeight", I = "clientWidth";
    if (v === w(n) && (v = W(n), R(v).position !== "static" && l === "absolute" && (L = "scrollHeight", I = "scrollWidth")), v = v, o === U || (o === P || o === Y) && i === G) {
      y = X;
      var q = m && v === b && b.visualViewport ? b.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        v[L]
      );
      g -= q - s.height, g *= r ? 1 : -1;
    }
    if (o === P || (o === U || o === X) && i === G) {
      C = Y;
      var j = m && v === b && b.visualViewport ? b.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        v[I]
      );
      f -= j - s.width, f *= r ? 1 : -1;
    }
  }
  var et = Object.assign({
    position: l
  }, d && _t), nt = c === !0 ? zt({
    x: f,
    y: g
  }, w(n)) : {
    x: f,
    y: g
  };
  if (f = nt.x, g = nt.y, r) {
    var k;
    return Object.assign({}, et, (k = {}, k[y] = B ? "0" : "", k[C] = E ? "0" : "", k.transform = (b.devicePixelRatio || 1) <= 1 ? "translate(" + f + "px, " + g + "px)" : "translate3d(" + f + "px, " + g + "px, 0)", k));
  }
  return Object.assign({}, et, (t = {}, t[y] = B ? g + "px" : "", t[C] = E ? f + "px" : "", t.transform = "", t));
}
function It(e) {
  var t = e.state, n = e.options, s = n.gpuAcceleration, o = s === void 0 ? !0 : s, i = n.adaptive, u = i === void 0 ? !0 : i, l = n.roundOffsets, r = l === void 0 ? !0 : l, d = {
    placement: ct(t.placement),
    variation: ut(t.placement),
    popper: t.elements.popper,
    popperRect: t.rects.popper,
    gpuAcceleration: o,
    isFixed: t.options.strategy === "fixed"
  };
  t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, ot(Object.assign({}, d, {
    offsets: t.modifiersData.popperOffsets,
    position: t.options.strategy,
    adaptive: u,
    roundOffsets: r
  })))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, ot(Object.assign({}, d, {
    offsets: t.modifiersData.arrow,
    position: "absolute",
    adaptive: !1,
    roundOffsets: r
  })))), t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-placement": t.placement
  });
}
const jt = {
  name: "computeStyles",
  enabled: !0,
  phase: "beforeWrite",
  fn: It,
  data: {}
};
var D = {
  passive: !0
};
function Dt(e) {
  var t = e.state, n = e.instance, s = e.options, o = s.scroll, i = o === void 0 ? !0 : o, u = s.resize, l = u === void 0 ? !0 : u, r = w(t.elements.popper), d = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return i && d.forEach(function(c) {
    c.addEventListener("scroll", n.update, D);
  }), l && r.addEventListener("resize", n.update, D), function() {
    i && d.forEach(function(c) {
      c.removeEventListener("scroll", n.update, D);
    }), l && r.removeEventListener("resize", n.update, D);
  };
}
const Ut = {
  name: "eventListeners",
  enabled: !0,
  phase: "write",
  fn: function() {
  },
  effect: Dt,
  data: {}
};
function pt(e) {
  var t = w(e), n = t.pageXOffset, s = t.pageYOffset;
  return {
    scrollLeft: n,
    scrollTop: s
  };
}
function Pt(e) {
  return F(W(e)).left + pt(e).scrollLeft;
}
function tt(e) {
  var t = R(e), n = t.overflow, s = t.overflowX, o = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(n + o + s);
}
function ft(e) {
  return ["html", "body", "#document"].indexOf(O(e)) >= 0 ? e.ownerDocument.body : $(e) && tt(e) ? e : ft(Q(e));
}
function N(e, t) {
  var n;
  t === void 0 && (t = []);
  var s = ft(e), o = s === ((n = e.ownerDocument) == null ? void 0 : n.body), i = w(s), u = o ? [i].concat(i.visualViewport || [], tt(s) ? s : []) : s, l = t.concat(u);
  return o ? l : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    l.concat(N(Q(u)))
  );
}
function Nt(e) {
  var t = e.reference, n = e.element, s = e.placement, o = s ? ct(s) : null, i = s ? ut(s) : null, u = t.x + t.width / 2 - n.width / 2, l = t.y + t.height / 2 - n.height / 2, r;
  switch (o) {
    case U:
      r = {
        x: u,
        y: t.y - n.height
      };
      break;
    case X:
      r = {
        x: u,
        y: t.y + t.height
      };
      break;
    case Y:
      r = {
        x: t.x + t.width,
        y: l
      };
      break;
    case P:
      r = {
        x: t.x - n.width,
        y: l
      };
      break;
    default:
      r = {
        x: t.x,
        y: t.y
      };
  }
  var d = o ? St(o) : null;
  if (d != null) {
    var c = d === "y" ? "height" : "width";
    switch (i) {
      case gt:
        r[d] = r[d] - (t[c] / 2 - n[c] / 2);
        break;
      case G:
        r[d] = r[d] + (t[c] / 2 - n[c] / 2);
        break;
    }
  }
  return r;
}
function Ft(e) {
  var t = e.state, n = e.name;
  t.modifiersData[n] = Nt({
    reference: t.rects.reference,
    element: t.rects.popper,
    placement: t.placement
  });
}
const Vt = {
  name: "popperOffsets",
  enabled: !0,
  phase: "read",
  fn: Ft,
  data: {}
};
function Wt(e) {
  return {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  };
}
function qt(e) {
  return e === w(e) || !$(e) ? pt(e) : Wt(e);
}
function Xt(e) {
  var t = e.getBoundingClientRect(), n = H(t.width) / e.offsetWidth || 1, s = H(t.height) / e.offsetHeight || 1;
  return n !== 1 || s !== 1;
}
function Yt(e, t, n) {
  n === void 0 && (n = !1);
  var s = $(t), o = $(t) && Xt(t), i = W(t), u = F(e, o, n), l = {
    scrollLeft: 0,
    scrollTop: 0
  }, r = {
    x: 0,
    y: 0
  };
  return (s || !s && !n) && ((O(t) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
  tt(i)) && (l = qt(t)), $(t) ? (r = F(t, !0), r.x += t.clientLeft, r.y += t.clientTop) : i && (r.x = Pt(i))), {
    x: u.left + l.scrollLeft - r.x,
    y: u.top + l.scrollTop - r.y,
    width: u.width,
    height: u.height
  };
}
function Gt(e) {
  var t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = [];
  e.forEach(function(i) {
    t.set(i.name, i);
  });
  function o(i) {
    n.add(i.name);
    var u = [].concat(i.requires || [], i.requiresIfExists || []);
    u.forEach(function(l) {
      if (!n.has(l)) {
        var r = t.get(l);
        r && o(r);
      }
    }), s.push(i);
  }
  return e.forEach(function(i) {
    n.has(i.name) || o(i);
  }), s;
}
function Zt(e) {
  var t = Gt(e);
  return Tt.reduce(function(n, s) {
    return n.concat(t.filter(function(o) {
      return o.phase === s;
    }));
  }, []);
}
function Kt(e) {
  var t;
  return function() {
    return t || (t = new Promise(function(n) {
      Promise.resolve().then(function() {
        t = void 0, n(e());
      });
    })), t;
  };
}
function Jt(e) {
  var t = e.reduce(function(n, s) {
    var o = n[s.name];
    return n[s.name] = o ? Object.assign({}, o, s, {
      options: Object.assign({}, o.options, s.options),
      data: Object.assign({}, o.data, s.data)
    }) : s, n;
  }, {});
  return Object.keys(t).map(function(n) {
    return t[n];
  });
}
var it = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function rt() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return !t.some(function(s) {
    return !(s && typeof s.getBoundingClientRect == "function");
  });
}
function Qt(e) {
  e === void 0 && (e = {});
  var t = e, n = t.defaultModifiers, s = n === void 0 ? [] : n, o = t.defaultOptions, i = o === void 0 ? it : o;
  return function(l, r, d) {
    d === void 0 && (d = i);
    var c = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, it, i),
      modifiersData: {},
      elements: {
        reference: l,
        popper: r
      },
      attributes: {},
      styles: {}
    }, m = [], x = !1, f = {
      state: c,
      setOptions: function(E) {
        var B = typeof E == "function" ? E(c.options) : E;
        g(), c.options = Object.assign({}, i, c.options, B), c.scrollParents = {
          reference: J(l) ? N(l) : l.contextElement ? N(l.contextElement) : [],
          popper: N(r)
        };
        var C = Zt(Jt([].concat(s, c.options.modifiers)));
        return c.orderedModifiers = C.filter(function(y) {
          return y.enabled;
        }), z(), f.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function() {
        if (!x) {
          var E = c.elements, B = E.reference, C = E.popper;
          if (rt(B, C)) {
            c.rects = {
              reference: Yt(B, dt(C), c.options.strategy === "fixed"),
              popper: At(C)
            }, c.reset = !1, c.placement = c.options.placement, c.orderedModifiers.forEach(function(j) {
              return c.modifiersData[j.name] = Object.assign({}, j.data);
            });
            for (var y = 0; y < c.orderedModifiers.length; y++) {
              if (c.reset === !0) {
                c.reset = !1, y = -1;
                continue;
              }
              var b = c.orderedModifiers[y], v = b.fn, L = b.options, I = L === void 0 ? {} : L, q = b.name;
              typeof v == "function" && (c = v({
                state: c,
                options: I,
                name: q,
                instance: f
              }) || c);
            }
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: Kt(function() {
        return new Promise(function(h) {
          f.forceUpdate(), h(c);
        });
      }),
      destroy: function() {
        g(), x = !0;
      }
    };
    if (!rt(l, r))
      return f;
    f.setOptions(d).then(function(h) {
      !x && d.onFirstUpdate && d.onFirstUpdate(h);
    });
    function z() {
      c.orderedModifiers.forEach(function(h) {
        var E = h.name, B = h.options, C = B === void 0 ? {} : B, y = h.effect;
        if (typeof y == "function") {
          var b = y({
            state: c,
            name: E,
            instance: f,
            options: C
          }), v = function() {
          };
          m.push(b || v);
        }
      });
    }
    function g() {
      m.forEach(function(h) {
        return h();
      }), m = [];
    }
    return f;
  };
}
var te = [Ut, Vt, jt, Rt], ht = /* @__PURE__ */ Qt({
  defaultModifiers: te
});
function T(e) {
  if (e < 0)
    throw new Error("Bytes cannot be negative");
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB", "GB"], s = Math.floor(Math.log(e) / Math.log(t));
  return parseFloat((e / Math.pow(t, s)).toFixed(s > 1 ? 2 : 0)) + " " + n[s];
}
function ee(e) {
  try {
    const { pathname: t } = new URL(e);
    return t.split("/").pop() || e;
  } catch {
    return e;
  }
}
function ne(e) {
  const t = document.querySelectorAll(`
      img[src],
      img[srcset],
      script[src],
      link[href],
      iframe[src],
      embed[src],
      object[data],
      source[src],
      source[srcset],
      track[src],
      audio[src],
      video[src],
      video[poster],
      input[src],
      frame[src],
      [style]
    `), n = [];
  return t.forEach((s) => {
    const o = e.pathname + e.search + e.hash, i = s.attributes;
    for (const u of i) {
      const l = u.value.toLowerCase(), r = o.toLowerCase();
      if (l.includes(r)) {
        n.push(s);
        break;
      }
    }
  }), n;
}
const A = class A {
};
A.cssClass = {
  resourceHint: "footprint-sentinel-hint",
  resourceHintOpen: "footprint-sentinel-hint--open",
  resourceHintIcon: "footprint-sentinel-hint__icon",
  resourceHintIconMark: "footprint-sentinel-hint__icon-mark",
  resourceHintContent: "footprint-sentinel-hint__content",
  sentinel: "footprint-sentinel",
  sentinelButtonDot: "footprint-sentinel__button-dot",
  sentinelButtonLabel: "footprint-sentinel__button-label",
  sentinelNumberOfResourceHints: "footprint-sentinel__number-of-resource-hints",
  modalOverlay: "footprint-sentinel__modal-overlay",
  modal: "footprint-sentinel__modal",
  modalClose: "footprint-sentinel__modal-close",
  modalBody: "footprint-sentinel__modal-body",
  modalTitle: "footprint-sentinel__modal-title",
  modalSubtitle: "footprint-sentinel__modal-subtitle",
  modalSummary: "footprint-sentinel__modal-summary",
  modalRatingBadge: "footprint-sentinel__modal-rating-badge",
  modalTable: "footprint-sentinel__modal-table",
  modalTableRowClickable: "footprint-sentinel__modal-table-row--clickable",
  modalEmpty: "footprint-sentinel__modal-empty",
  highlight: "footprint-sentinel__highlight"
}, A.ratingColors = {
  "A+": "#00febc",
  A: "#1aff93",
  B: "#49ff42",
  C: "#70ff01",
  D: "#f9ff00",
  E: "#fea900",
  F: "#fd0100"
}, A.cssVar = {
  ratingColor: "--footprint-sentinel-rating-color"
}, A.dataAttr = {
  resourceUrl: "data-resource-url",
  hasSentinelHint: "data-has-sentinel-hint",
  sizeBytes: "data-size-bytes",
  maxBytesAllowed: "data-max-bytes-allowed"
};
let a = A;
const p = a.cssClass, se = `
    <style>
        :root    {    
            ${a.cssVar.ratingColor}: #ccc;
        }   
        .${p.resourceHint} {
           box-sizing: border-box;
           position: relative;
           pointer-events: none;
        }

        .${p.resourceHintIcon} {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background: #fd0100;
            color: white;
            font-weight: bold;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
            border: none;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            padding: 0;
            overflow: hidden;
            transition: width 150ms ease, height 150ms ease, background-color 150ms ease, color 150ms ease;
        }

        .${p.resourceHintIcon} .${p.resourceHintContent} {
            display: none;
        }

        .${p.resourceHintIconMark} {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
        }

        .${p.resourceHintIconMark} svg {
            width: 100%;
            height: 100%;
            display: block;
        }

        .${p.resourceHintOpen} .${p.resourceHintIcon} {
            width: auto;
            height: auto;
            min-width: 24px;
            min-height: 24px;
            padding: 6px 10px;
            background: white;
            color: black;
        }

        .${p.resourceHintOpen} .${p.resourceHintIcon} .${p.resourceHintIconMark} {
            display: none;
        }

        .${p.resourceHintOpen} .${p.resourceHintIcon} .${p.resourceHintContent} {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            line-height: 1.3;
            white-space: nowrap;
        }
        
        .${p.sentinel} {
            display: flex;
            align-items: center;
            gap: 8px;
            position: fixed;
            bottom: 16px;
            right: 16px;
            padding: 8px 14px;
            border: none;
            border-radius: 999px;
            background: white;
            color: black;
            font-size: 14px;
            font-family: Helvetica, Arial, sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
            transition: box-shadow 150ms ease;
        }

        .${p.sentinel}:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        }

        .${p.sentinelButtonDot} {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(${a.cssVar.ratingColor});
            flex-shrink: 0;
        }

        .${p.sentinelButtonLabel} {
            white-space: nowrap;
        }

        .${p.sentinelNumberOfResourceHints} {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            border-radius: 10px;
            background: #fd0100;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }

        .${p.modalOverlay} {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 10000;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
            font-family: Helvetica, Arial, sans-serif;
            color: black;
        }

        .${p.modal} {
            position: relative;
            width: calc(100% - 32px);
            max-width: 640px;
            max-height: calc(100vh - 64px);
            overflow-y: auto;
            background: white;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .${p.modalClose} {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            background: transparent;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
        }

        .${p.modalClose}:hover {
            background: rgba(0,0,0,0.08);
        }

        .${p.modalTitle} {
            margin: 0 0 16px;
            font-size: 18px;
        }

        .${p.modalSubtitle} {
            margin: 24px 0 12px;
            font-size: 15px;
        }

        .${p.modalSummary},
        .${p.modalTable} {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .${p.modalSummary} th,
        .${p.modalSummary} td,
        .${p.modalTable} th,
        .${p.modalTable} td {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #eee;
        }

        .${p.modalRatingBadge} {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            padding: 2px 6px;
            margin-right: 6px;
            border-radius: 4px;
            background: var(${a.cssVar.ratingColor});
            font-weight: bold;
        }

        .${p.modalEmpty} {
            color: #666;
            font-size: 14px;
        }

        .${p.modalTableRowClickable} {
            cursor: pointer;
        }

        .${p.modalTableRowClickable}:hover {
            background: rgba(0,0,0,0.04);
        }

        .${p.highlight} {
            position: absolute;
            pointer-events: none;
            background: rgba(253, 1, 0, 0.7);
            animation: footprint-sentinel-highlight-fade 1500ms ease 500ms backwards;
        }

        @keyframes footprint-sentinel-highlight-fade {
            0% {
                opacity: 0;
            }
            25% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
    </style>
`, K = {
  // activate the Footprint Sentinel -> callbacks will work.
  // if no ui is activated, footprint sentinel can be used to collect data, e.g. matomo or Google Analytics
  isActivated: !0,
  // Show two bars in the bottom right corner of the screen. The initial and total footprints with their rating
  showSentinel: !0,
  // Show resource hints in the DOM, if a resource exceeds the defined thresholds
  showResourceHints: !0,
  // Thresholds for resource sizes based on the area they occupy (similar to what Lighthouse uses)
  // Can be used to debug srcset images, e.g. by resizing the browser window, new resources will loaded
  // and flagged if they exceed the threshold
  // For the default value we used trial and error to find a reasonable value
  maxBytesPer100x100Threshold: 10 * 1024,
  // Threshold for the maximum size of a single resource
  // With maxBytesPer100x100Threshold we allow pretty large resources e.g. full width images
  // This is a hard limit for the size of a single resource, e.g. a large image.
  maxBytesPerResourceThreshold: 200 * 1024,
  // Threshold for resources that should be ignored
  // e.g. small images that are used for icons, logos or similar. They might end up getting flagged
  // because of the maxBytesPer100x100Threshold, but do not contribute significantly to the overall footprint.
  // Speed up the performance by ignoring these resources.
  ignoreResourcesBelowBytesThreshold: 40 * 1024,
  // zIndex to be used for displaying the footprint sentinel. Change this if you have other elements overlapping
  // the sentinel.
  sentinelZIndex: 1e4,
  // Default filter that allows all resources
  // Can be used to e.g. filter out Neos backend resources
  skipResource: () => !1
}, mt = {
  name: "samePositionAndSize",
  enabled: !0,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn: ({ state: e }) => {
    e.styles.popper.width = `${e.rects.reference.width}px`, e.styles.popper.height = `${e.rects.reference.height}px`, e.styles.popper.left = `-${e.rects.reference.width}px`, e.styles.popper.zIndex = "1";
  }
};
class oe {
  constructor(t, n) {
    this.url = t.name, this.size = at(t), this.options = n;
  }
  /**
   * The resource decides if it needs to be updated based on the new resource size.
   *
   * @param resource - The PerformanceResourceTiming object containing updated resource data
   * @returns True if the resource size was updated, false if no change was needed
   */
  updateIfNeeded(t) {
    if (t.name !== this.url)
      throw `Resource URL mismatch: expected ${this.url}, got ${t.name}`;
    const n = at(t);
    return this.size !== n ? (this.size = n, !0) : !1;
  }
  /**
   * Render a hint for the resource if it exceeds the size threshold. We fill search the dom for
   * the url and the render the hint for each element that matches the resource URL.
   *
   * @param element - The DOM element representing the resource, e.g. an image or video element
   */
  renderHint(t) {
    if (this.size < this.options.ignoreResourcesBelowBytesThreshold) return;
    const n = t.parentElement;
    if (!n || !(t instanceof HTMLElement)) return;
    let s = t;
    switch (!0) {
      case n instanceof HTMLPictureElement:
        s = n.getElementsByTagName("img").item(0);
        break;
      case n instanceof HTMLVideoElement:
        s = n;
        break;
    }
    let o = s.getBoundingClientRect();
    const i = window.devicePixelRatio || 1, l = o.width * o.height * i * i / 1e4 * this.options.maxBytesPer100x100Threshold;
    if (l <= 0)
      return;
    const r = Math.min(
      l,
      this.options.maxBytesPerResourceThreshold
    );
    if (this.size > r && // IMPORTANT: We only render the hint once per element -> otherwise the browser will freeze when trying
    // to rerender the popper
    !s.hasAttribute(a.dataAttr.hasSentinelHint)) {
      s.setAttribute(a.dataAttr.hasSentinelHint, "true");
      const d = document.createElement("div");
      d.classList.add(a.cssClass.resourceHint), d.setAttribute(a.dataAttr.resourceUrl, this.url), d.setAttribute(a.dataAttr.sizeBytes, String(this.size)), d.setAttribute(
        a.dataAttr.maxBytesAllowed,
        String(r)
      ), d.innerHTML = `
          <button type="button" class="${a.cssClass.resourceHintIcon}" aria-label="Resource size warning" aria-expanded="false">
            <span class="${a.cssClass.resourceHintIconMark}" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM224 176C250.5 176 272 197.5 272 224C272 250.5 250.5 272 224 272C197.5 272 176 250.5 176 224C176 197.5 197.5 176 224 176zM368 288C376.4 288 384.1 292.4 388.5 299.5L476.5 443.5C481 450.9 481.2 460.2 477 467.8C472.8 475.4 464.7 480 456 480L184 480C175.1 480 166.8 475 162.7 467.1C158.6 459.2 159.2 449.6 164.3 442.3L220.3 362.3C224.8 355.9 232.1 352.1 240 352.1C247.9 352.1 255.2 355.9 259.7 362.3L286.1 400.1L347.5 299.6C351.9 292.5 359.6 288.1 368 288.1z"/></svg>
            </span>
            <span class="${a.cssClass.resourceHintContent}">
              <strong style="font-size: 1.2em">${T(this.size)}</strong>
              <span>max ${T(r)}</span>
            </span>
          </button>
        `, s.insertAdjacentElement("afterend", d);
      const c = d.querySelector(
        `.${a.cssClass.resourceHintIcon}`
      );
      c.addEventListener("click", (m) => {
        m.stopPropagation(), m.preventDefault();
        const x = d.classList.toggle(a.cssClass.resourceHintOpen);
        c.setAttribute("aria-expanded", String(x));
      }), document.addEventListener("click", (m) => {
        d.contains(m.target) || (d.classList.remove(a.cssClass.resourceHintOpen), c.setAttribute("aria-expanded", "false"));
      }), ht(s, d, {
        placement: "right-start",
        modifiers: [mt]
      });
    }
  }
}
function at(e) {
  return e.transferSize || e.encodedBodySize || 0;
}
const ie = 200, re = 1e3, ae = 2e3;
class V {
  constructor(t) {
    this.resources = {}, this.initialBytes = null, this.onInitialFootprint = () => {
    }, this.onResourceUpdated = () => {
    }, this._updateTimeout = null, this._currentUpdateInterval = ie, this._documentLoadedTimestampMs = null, this.options = t.options, this.onResourceUpdated = t.onResourceUpdated, this.onInitialFootprint = t.onInitialFootprint;
  }
  /**
   * Factory method to create a new instance of FSResources with default options.
   * This is useful for lazy initialization or when you want to create the instance later.
   */
  static later() {
    return new V({
      options: K,
      onResourceUpdated: () => null,
      onInitialFootprint: () => null
    });
  }
  /**
   * Adds an event listener for DOMContentLoaded, scroll, and resize events to update the resources.
   * This method is called to start tracking resources on the page. We use a timer with backoff strategy
   * to update the resources periodically. Some events like scroll and resize will reset the timer and
   * trigger an immediate update of the resources.
   *
   * WHY: There does not seem to be a reliable way to detect changes of the performance entries, e.g.
   * through some kind of event listener or observer. We tried a MutationObserver, but it did not work.
   */
  watch() {
    window.addEventListener("DOMContentLoaded", () => {
      this._documentLoadedTimestampMs = Date.now(), this.scheduleNextUpdate(!0);
    }), window.addEventListener("scroll", () => {
      this.scheduleNextUpdate(!0);
    }), window.addEventListener("resize", () => {
      this.scheduleNextUpdate(!0);
    });
  }
  /**
   * Adds a new resource or updates an existing one based on the resource url. If the resource already exists,
   * it checks if the size has changed and updates it if necessary. A rerender of the resource hint is triggered
   *
   * @param resource
   * @returns The current instance of FSResources for chaining
   */
  addResource(t) {
    return this.resources[t.name] ? this.resources[t.name].updateIfNeeded(t) && this.onResourceUpdated(this.resources[t.name]) : (this.resources[t.name] = new oe(t, this.options), this.onResourceUpdated(this.resources[t.name])), this;
  }
  /**
   * Returns the total size of all resources in bytes. This is useful to get the total footprint of the page.
   *
   * @returns The total size of all resources in bytes
   */
  totalBytes() {
    return Object.values(this.resources).reduce((t, n) => t + n.size, 0);
  }
  /**
   * Set the initial load bytes if it is not already set and if enough time has passed
   * since the document was loaded. The initial bytes are set approximately 1 second
   * after the document is loaded.
   */
  _tryToSetInitialLoadBytesIfNull() {
    if (this.initialBytes) return;
    const t = Date.now();
    this._documentLoadedTimestampMs && t >= this._documentLoadedTimestampMs + re && (this.initialBytes = this.totalBytes(), this._currentUpdateInterval = ae, this.onInitialFootprint());
  }
  /**
   * Schedules the next update of the resources. If reset is true, it will reset the timer and
   * start a new one. If reset is false, it will continue with the current timer.
   * The initial update is done immediately after the document is loaded.
   *
   * @param reset - Whether to reset the timer or not
   */
  scheduleNextUpdate(t = !1) {
    this._updateWithCurrentPerformanceEntries(), this._tryToSetInitialLoadBytesIfNull(), t ? (this._updateTimeout && clearTimeout(this._updateTimeout), this.scheduleNextUpdate()) : this._updateTimeout = setTimeout(() => {
      this.scheduleNextUpdate();
    }, this._currentUpdateInterval);
  }
  /**
   * Updates the resources with the current performance entries. This is called periodically to
   * ensure that we have the latest resource data. It collects all resource entries from the
   * Performance API and adds them to the resources map if they pass the filter.
   *
   * @returns The current instance of FSResources for chaining
   */
  _updateWithCurrentPerformanceEntries() {
    return [
      ...performance.getEntriesByType("resource"),
      performance.getEntriesByType("navigation")[0]
    ].forEach((n) => {
      n instanceof PerformanceResourceTiming && // The filter can be used to filter out resources that should not be tracked
      // e.g. some backend or cms resources
      !this.options.skipResource(n.name) && this.addResource(n);
    }), this;
  }
}
function S(e) {
  const t = e / 1024;
  return t < 272.51 ? "A+" : t < 531.15 ? "A" : t < 975.85 ? "B" : t < 1410.39 ? "C" : t < 1875.01 ? "D" : t < 2419.56 ? "E" : "F";
}
function _(e) {
  switch (e) {
    case "A+":
      return a.ratingColors["A+"];
    case "A":
      return a.ratingColors.A;
    case "B":
      return a.ratingColors.B;
    case "C":
      return a.ratingColors.C;
    case "D":
      return a.ratingColors.D;
    case "E":
      return a.ratingColors.E;
    case "F":
      return a.ratingColors.F;
    default:
      throw new Error(`Unknown rating: ${e}`);
  }
}
class M extends EventTarget {
  constructor(t) {
    super(), this.footprintElement = null, this.options = K, this.resources = V.later(), this.lastTotalBytes = 0, this.lastTotalBytesDebounceTimeout = null, this.modalElement = null, this.isModalOpen = !1, !M.instance && (this.options = {
      ...K,
      ...t
    }, this.options.isActivated && (this.resources = new V({
      options: this.options,
      onResourceUpdated: this.handleResourceUpdated.bind(this),
      onInitialFootprint: this._handleInitialFootprint.bind(this)
    }), this.options.showSentinel && (this.footprintElement = this.addSentinelElement(), this.modalElement = this.addModalElement()), (this.options.showSentinel || this.options.showResourceHints) && document.body.insertAdjacentHTML("beforeend", se), this.resources.watch()), M.instance = this);
  }
  /**
   * Returns the current footprint. E.g. can be used to get the total footprint
   * before the page is unloaded to report it to an analytics service.
   */
  get footprint() {
    const t = this.resources.totalBytes(), n = t - this.lastTotalBytes, s = S(t), o = _(s);
    return {
      total: {
        bytes: t,
        bytesFormatted: T(t),
        rating: s,
        color: o
      },
      lastDelta: { bytes: n, bytesFormatted: T(n) }
    };
  }
  /**
   * Updates the sentinel with the latest resource data and renders a possible resource hint
   * if the resource exceeds the defined thresholds.
   *
   * Also calls the onFootprintChange callback if defined in options. It debounces the calls.
   * The callback can be used to report the footprint to an analytics service or to create a custom UI
   * showing the footprint. e.g. in the footer of the page.
   */
  handleResourceUpdated(t) {
    this.lastTotalBytesDebounceTimeout && clearTimeout(this.lastTotalBytesDebounceTimeout);
    const n = this.options.onFootprintChange;
    n && (this.lastTotalBytesDebounceTimeout = window.setTimeout(() => {
      const s = this.resources.totalBytes();
      if (s > this.lastTotalBytes + 100 * 1024) {
        const o = s - this.lastTotalBytes, i = S(s);
        n({
          total: {
            bytes: s,
            bytesFormatted: T(s),
            rating: i,
            color: _(i)
          },
          lastDelta: {
            bytes: o,
            bytesFormatted: T(o)
          }
        }), this.lastTotalBytes = s;
      }
    }, 500)), this._updateResourceHint(t), this._updateFootprint();
  }
  /**
   * Calls onInitialFootprint if present in options and initial footprint is set.
   */
  _handleInitialFootprint() {
    this.options.onInitialFootprint && this.options.onInitialFootprint(this.footprint);
  }
  /**
   * Updates the footprint sentinel button in the bottom right corner: the dot color reflects
   * the current rating, and a badge shows the number of oversized resources found so far.
   * Also refreshes the modal content if it is currently open.
   * This is called whenever a resource is updated.
   */
  _updateFootprint() {
    if (!this.options?.showSentinel || !this.footprintElement) return;
    const t = this.options.showResourceHints ? document.querySelectorAll(
      `[${a.dataAttr.hasSentinelHint}="true"]`
    ).length : 0, n = this.resources.totalBytes(), s = S(n), o = _(s), i = t > 0 ? `<span class="${a.cssClass.sentinelNumberOfResourceHints}">${t}</span>` : "";
    this.footprintElement.innerHTML = `
        <span class="${a.cssClass.sentinelButtonDot}" style="${a.cssVar.ratingColor}: ${o};"></span>
        <span class="${a.cssClass.sentinelButtonLabel}">Show page load</span>
        ${i}
    `, this.isModalOpen && this._renderModalContent();
  }
  _updateResourceHint(t) {
    this.options?.showResourceHints && (t.size < this.options.ignoreResourcesBelowBytesThreshold || ne(new URL(t.url)).forEach((n) => {
      t.renderHint(n);
    }));
  }
  addSentinelElement() {
    if (document.querySelector(`.${a.cssClass.sentinel}`))
      return console.warn(
        "FootprintGuard element already exists, skipping initialization."
      ), null;
    const t = document.createElement("button");
    return t.type = "button", t.className = a.cssClass.sentinel, t.style.zIndex = this.options.sentinelZIndex.toString(), t.setAttribute("aria-haspopup", "dialog"), t.setAttribute("aria-expanded", "false"), t.setAttribute("aria-controls", "footprint-sentinel-modal"), t.addEventListener("click", () => this._toggleModal()), document.body.appendChild(t), t;
  }
  /**
   * Creates the (initially hidden) modal showing the page load overview. It is built once
   * and its content is (re-)rendered whenever it is opened or the footprint changes while open.
   */
  addModalElement() {
    const t = document.createElement("div");
    return t.className = a.cssClass.modalOverlay, t.id = "footprint-sentinel-modal", t.innerHTML = `
        <div class="${a.cssClass.modal}" role="dialog" aria-modal="true" aria-label="Page load overview">
            <button type="button" class="${a.cssClass.modalClose}" aria-label="Close">&times;</button>
            <div class="${a.cssClass.modalBody}"></div>
        </div>
    `, t.addEventListener("click", (n) => {
      n.target === t && this._closeModal();
    }), t.querySelector(`.${a.cssClass.modalClose}`).addEventListener("click", () => this._closeModal()), document.addEventListener("keydown", (n) => {
      n.key === "Escape" && this.isModalOpen && this._closeModal();
    }), document.body.appendChild(t), t;
  }
  _toggleModal() {
    this.isModalOpen ? this._closeModal() : this._openModal();
  }
  _openModal() {
    this.modalElement && (this._renderModalContent(), this.modalElement.style.display = "flex", this.isModalOpen = !0, this.footprintElement?.setAttribute("aria-expanded", "true"));
  }
  _closeModal() {
    this.modalElement && (this.modalElement.style.display = "none", this.isModalOpen = !1, this.footprintElement?.setAttribute("aria-expanded", "false"));
  }
  /**
   * Renders the modal body: a summary table (total/initial bytes, page load time) and a
   * table of oversized resources, sourced from the resource hints already rendered on the page.
   */
  _renderModalContent() {
    if (!this.modalElement) return;
    const t = this.modalElement.querySelector(
      `.${a.cssClass.modalBody}`
    );
    if (!t) return;
    const n = this.resources.totalBytes(), s = this.resources.initialBytes || 0, o = S(n), i = S(s), u = this._getPageLoadTimeMs(), l = this._getOversizedResources();
    t.innerHTML = `
        <h2 class="${a.cssClass.modalTitle}">Page load overview</h2>
        <table class="${a.cssClass.modalSummary}">
            <tbody>
                <tr>
                    <th>Total transferred</th>
                    <td>
                        <span class="${a.cssClass.modalRatingBadge}" style="${a.cssVar.ratingColor}: ${_(o)};">${o}</span>
                        ${T(n)}
                    </td>
                </tr>
                <tr>
                    <th>Initial (above the fold)</th>
                    <td>
                        ${s ? `<span class="${a.cssClass.modalRatingBadge}" style="${a.cssVar.ratingColor}: ${_(i)};">${i}</span> ${T(s)}` : "–"}
                    </td>
                </tr>
                <tr>
                    <th>Page load time</th>
                    <td>${u !== null ? `${(u / 1e3).toFixed(2)}s` : "measuring…"}</td>
                </tr>
            </tbody>
        </table>

        <h3 class="${a.cssClass.modalSubtitle}">Oversized images (${l.length})</h3>
        ${l.length === 0 ? `<p class="${a.cssClass.modalEmpty}">No oversized resources detected.</p>` : `<table class="${a.cssClass.modalTable}">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Size</th>
                            <th>Max allowed</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${l.map(
      (r, d) => `
                            <tr
                                class="${r.element ? a.cssClass.modalTableRowClickable : ""}"
                                data-index="${d}"
                                title="${r.url}"
                            >
                                <td>${ee(r.url)}</td>
                                <td>${T(r.size)}</td>
                                <td>${T(r.maxBytesAllowed)}</td>
                            </tr>
                        `
    ).join("")}
                    </tbody>
                </table>`}
    `, t.querySelectorAll(
      `.${a.cssClass.modalTableRowClickable}`
    ).forEach((r) => {
      const d = Number(r.dataset.index), c = l[d]?.element;
      c && r.addEventListener("click", () => this._scrollToElement(c));
    });
  }
  /**
   * Closes the modal and scrolls the given element into view, briefly highlighting it
   * so it is easy to spot which image was flagged.
   */
  _scrollToElement(t) {
    this._closeModal(), t.scrollIntoView({ behavior: "smooth", block: "center" }), this._flashHighlightOverlay(t);
  }
  /**
   * Overlays a translucent red div exactly on top of the given element and fades it out.
   * WHY not a CSS class/filter directly on the element? A class on an <img> can't paint a
   * color over its pixels (box-shadow is not drawn on top of replaced element content, and a
   * filter recolors the image itself instead of overlaying it) — so, same as the resource
   * hints, we position a real overlay element with popper.js.
   */
  _flashHighlightOverlay(t) {
    const n = document.createElement("div");
    n.className = a.cssClass.highlight, t.insertAdjacentElement("afterend", n);
    const s = ht(t, n, {
      placement: "right-start",
      modifiers: [mt]
    });
    n.addEventListener("animationend", () => {
      s.destroy(), n.remove();
    });
  }
  /**
   * Time (in ms) until the page's load event finished, based on the Navigation Timing entry.
   * Returns null while the page is still loading.
   */
  _getPageLoadTimeMs() {
    const t = performance.getEntriesByType(
      "navigation"
    )[0];
    return !t || !t.loadEventEnd ? null : t.loadEventEnd;
  }
  /**
   * Reads the oversized resources already flagged via resource hints (see FSResource.renderHint),
   * so the modal table reuses the exact same area-based threshold evaluation instead of duplicating it.
   * Also resolves the flagged DOM element itself (the hint is always inserted right after it),
   * so the modal can scroll to it when its row is clicked.
   */
  _getOversizedResources() {
    const t = document.querySelectorAll(
      `.${a.cssClass.resourceHint}`
    ), n = [];
    return t.forEach((s) => {
      const o = s.getAttribute(a.dataAttr.resourceUrl);
      o && n.push({
        url: o,
        size: Number(s.getAttribute(a.dataAttr.sizeBytes)),
        maxBytesAllowed: Number(
          s.getAttribute(a.dataAttr.maxBytesAllowed)
        ),
        element: s.previousElementSibling instanceof HTMLElement ? s.previousElementSibling : null
      });
    }), n.sort((s, o) => o.size - s.size);
  }
  static getInstance(t) {
    return M.instance || (M.instance = new M(t)), M.instance;
  }
}
export {
  M as default
};
//# sourceMappingURL=index.mjs.map
