import auditFactory, { requireData, makeIssueList } from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Unique Spate Time';
const DESCRIPTION = 'Check data sheet for duplicate space time data';

let checkUniqueSpaceTime = (data) => {
  let includeDepth = Boolean(data[0].depth || data[0].depth == 0);
  let obj = {};
  let result = []; //{row: Number, matched: Number}

  try {
    for (let i = 0; i < data.length; i++) {
      if (obj[data[i].time] === undefined) {
        obj[data[i].time] = {};
      }

      if (obj[data[i].time][data[i].lat] === undefined) {
        obj[data[i].time][data[i].lat] = {};
      }

      if (!includeDepth) {
        if (obj[data[i].time][data[i].lat][data[i].lon] === undefined) {
          obj[data[i].time][data[i].lat][data[i].lon] = i + 2;
        } else {
          result.push({
            row: i + 2,
            matched: obj[data[i].time][data[i].lat][data[i].lon],
          });
          if (result.length > 5) {
            return result;
          }
        }
      } else {
        if (obj[data[i].time][data[i].lat][data[i].lon] === undefined) {
          obj[data[i].time][data[i].lat][data[i].lon] = {};
        }

        if (
          obj[data[i].time][data[i].lat][data[i].lon][data[i].depth] ===
          undefined
        ) {
          obj[data[i].time][data[i].lat][data[i].lon][data[i].depth] = i + 2;
        } else {
          result.push({
            row: i + 2,
            matched: obj[data[i].time][data[i].lat][data[i].lon][data[i].depth],
          });
          if (result.length > 5) {
            return result;
          }
        }
      }
    }
  } catch (e) {
    result = [];
  }

  return result;
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = [];

  // check

  const duplicates = checkUniqueSpaceTime(data);

  if (duplicates.length) {
    results.push(
      makeIssueList(
        severity.warning,
        'Rows with duplicate space-time values detected',
        {
          text: 'Found non-unique space and time value combinations:',
          list: duplicates.map((e) => `Row ${e.row} matched ${e.matched}`),
        },
      ),
    );
  }

  return results;
};

const auditFn = requireData(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
