let month = {
  0: 'Jan',
  1: 'Feb',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'Aug',
  8: 'Sept',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

export const formatDate = (d) => {
  if (!d) {
    return [];
  }
  let monthName = month[d.getMonth()];

  let date = `${monthName} ${d.getDate()}, ${d.getFullYear()}`;

  let m = d.getMinutes();
  let minutes = m < 10 ? `0${m}` : `${m}`;

  let h = d.getHours();
  let twelveHour = h > 12 ? h - 12 : h;
  let ampm = h > 11 ? 'PM' : 'AM';

  let time = `${twelveHour}:${minutes} ${ampm}`;

  return [date, time];
};

let typeIsNumber = (n) => typeof n === 'number';
let isNotANumber = (n) => !typeIsNumber(n);

export const sortStories = (sortTerm, stories, order) => {
  let sortedStories = stories;
  if (
    ['modify_date', 'create_date', 'publish_date', 'view_status'].includes(
      sortTerm,
    )
  ) {
    sortedStories = [].concat(stories).sort((a, b) => {
      let result;
      if (a[sortTerm] >= b[sortTerm]) {
        result = -1; // sort a before b
      } else {
        result = 1; // sort b before a
      }
      return order === 'descending' ? result : -result;
    });
  } else if (sortTerm === 'rank') {
    sortedStories = [].concat(stories).sort((a, b) => {
      let result;
      if (isNotANumber(a.rank) && isNotANumber(b.rank)) {
        result = -1;
      } else if (typeIsNumber(a.rank) && isNotANumber(b.rank)) {
        result = -1;
      } else if (isNotANumber(a.rank) && typeIsNumber(b.rank)) {
        result = 1;
      } else if (a[sortTerm] <= b[sortTerm]) {
        result = -1; // sort a before b
      } else {
        result = 1; // sort b before a
      }
      return order === 'descending' ? result : -result;
    });
  } else if (sortTerm === 'simulate') {
    sortedStories = [].concat(stories).sort((a, b) => {
      let result;
      // if either has a rank, produce a comparison result
      if (typeIsNumber (a.rank) || typeIsNumber (b.rank)) {
        if (typeIsNumber(a.rank) && isNotANumber(b.rank)) {
          result = -1;
        } else if (isNotANumber(a.rank) && typeIsNumber(b.rank)) {
          result = 1;
        } else if (typeIsNumber(a.rank) && typeIsNumber(b.rank)) {
          if (a.rank < b.rank) {
            result = -1; // sort lower ranks higher: rank 1 is highest
          } else {
            result = 1;
          }
        }

      } else // otherwise, try to get a comparison of pub dates
        if (a.publish_date && !b.publish_date) {
        result = -1;
      } else if (!a.publish_date && b.publish_date) {
        result = 1;
      } else if (a.publish_date && b.publish_date) {
        if (a.publish_date >= b.publish_date) {
          result = -1;
        } else {
          result = 1;
        }
      } else // as a last resort, sort by create_date
        // this should only happen if all stories are in 'preview'
        if (!a.publish_date && !b.publish_date) {
                if (a.create_date >= b.create_date) {
          result = -1;
        } else {
          result = 1;
        }
      }

      return order === 'descending' ? result : -result;
    });
  }

  return sortedStories;
};

// filter and sort stories for production
export const productionStories = (stories) => {
  if (!stories || !Array.isArray(stories)) {
    return [];
  }
  let filteredStories = stories.filter(({ view_status }) => view_status === 3);

  return sortStories('simulate', filteredStories, 'descending');
};

// filter and sort stories for preview
export const previewStories = (stories) => {
  if (!stories || !Array.isArray(stories)) {
    return [];
  }
  let filteredStories = stories.filter(
    ({ view_status }) => view_status === 3 || view_status === 2,
  );
  return sortStories('simulate', filteredStories, 'descending');
};

export const getEnv = () => {
  let host = window.location.host;

  if (host === 'simonscmap.com') {
    return 'production';
  } else if (host === 'simonscmap.dev') {
    return 'staging';
  } else if (host.slice(0, 9) === 'localhost') {
    // independent of port
    return 'development';
  } else {
    // default to production
    console.warn('failed to detect env; defaulting to production');
    return 'production';
  }
};

export const prepareHomepageNews = (stories) => {
  let env = getEnv();
  switch (env) {
    case 'production':
      return productionStories(stories);
    case 'staging':
    case 'development':
      return previewStories(stories);
    default:
      return productionStories(stories);
  }
};

export const rankedStories = (stories = []) => {
  let ranked = stories.filter(({ rank }) => typeof rank === 'number');
  ranked.sort((a, b) => {
    return a.rank < b.rank ? -1 : 1;
  });

  return ranked;
};

export const getRanks = (stories = []) => {
  return rankedStories(stories).map(({ ID, rank }) => ({ ID, rank }));
};

export const prepareRanksPayload = (stories = []) =>
  stories.map(({ ID }, ix) => ({ ID, rank: ix }));
