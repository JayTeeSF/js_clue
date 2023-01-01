/*
 * UTILITY Fn:
 * Linear Interpolation:
 * get values between L(eft) & R(ight)
 * based on the p(ercent)
 *
 * L plus the difference times the percentage
 * when p is 0, you only have L
 * when p is 1, you're left with R
 *    (the minus-L will cancel-out the L)
 * so the output-values range from L to R
 */
function lerp(L,R,p) {
  return L+(R-L)*p;
}

//unexplained ...line-segment intersection
function getIntersection(s1s,s1e,s2s,s2e) {
  const tTop = (s2e.x - s2s.x)*(s1s.y - s2s.y) - (s2e.y - s2s.y)*(s1s.x - s2s.x); const uTop = (s2s.y - s1s.y)*(s1s.x - s1e.x) - (s2s.x - s1s.x)*(s1s.y - s1e.y);
  const bottom = (s2e.y - s2s.y)*(s1e.x - s1s.x) - (s2e.x - s2s.x)*(s1e.y - s1s.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(s1s.x,s1e.x,t),
        y: lerp(s1s.y,s1e.y,t),
        offset: t
      }
    }
  }

  return null;
}

function polysIntersect(poly1, poly2) {
  for(let i=0; i < poly1.length; i++) {
    for(let j=0; j < poly2.length; j++) {
      // handle last polygon point
      // i.e. when i == poly<N>.length - 1
      // by using modulo ...and thus connecting
      // the polygon's last point with it's first point!
      const touch = getIntersection(
        poly1[i], poly1[(i+1)%poly1.length],
        poly2[j], poly2[(j+1)%poly2.length]
      );
      if(touch) {
        return true;
      }
    }
  }
  return false;
}

function getRGBA(value){
    const alpha=Math.abs(value);
    const R=value<0?0:255;
    const G=R;
    const B=value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}
