import auditFactory, {
  requireData,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Radians';
const DESCRIPTION = 'Check lat and lon values are not in radians';

let checkRadians = (data) => {
  let lonMin = data[0].lon;
  let lonMax = data[0].lon;
  let latMin = data[0].lat;
  let latMax = data[0].lat;
  let pi = Math.PI;

  data.forEach((e) => {
    if (e.lon < lonMin) {
      lonMin = e.lon;
    }
    if (e.lon > lonMax) {
      lonMax = e.lon;
    }
    if (e.lat < latMin) {
      latMin = e.lat;
    }
    if (e.lat > latMax) {
      latMax = e.lat;
    }
  });

  return Boolean(
    lonMin >= -pi && lonMax <= pi && latMin >= -pi / 2 && latMax <= pi / 2,
  );
};
// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = []

  let err = checkRadians (data);

  if (err) {
    const msg = 'Values supplied for lat and lon indicate the possible use of radian as unit of measurement. Lat and lon must be in degrees north and degrees east, respectively.';
    results.push (makeSimpleIssue (
      severity.warning,
      'Values for lat/lon may be in radians',
      msg,
    ));
  }

  return results;
}

const auditFn = requireData (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
