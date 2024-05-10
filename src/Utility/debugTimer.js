export const formatEvent = (ev) => {
  return {
    tag: ev.tag,
    share: `${(ev.share * 100).toFixed(2)}%`, // convert to %
    duration: `${(ev.duration / 1000).toFixed(2)}s`, // convert ms to seconds
  };
};

export const debugTimer = (timerTitle) => {
  const events = [];

  const add = (tag) => {
    events.push ({
      tag,
      time: Date.now(),
    });
  }

  const report = () => {
    if (events.length <= 0) {
      console.log ('no events to report');
      return;
    }

    const startIndex = events.findIndex ((e) => e.tag === 'START');
    const endIndex = events.findIndex((e) => e.tag === 'DONE');

    if (startIndex === -1 || endIndex === -1) {
      // console.log ('timer missing start or end marker', events);
    }

    const events_ = events
      .slice (startIndex, endIndex + 1)

    const timeStart = events_[0].time;
    const elapsedTime = events_[events_.length - 1].time - timeStart;

    const results = events_.map ((ev, i) => {
      if (ev.tag !== 'DONE') {
        const duration = events_[i + 1].time - ev.time;
        const share = duration / elapsedTime;
        const { tag } = ev;
        return formatEvent ({ tag, share, duration });
      } else {
        return ev;
      }
    });

    if (typeof timerTitle === 'string') {
      console.log (`Profile results for ${timerTitle}`);
    }
    console.table (results.slice (0, results.length - 1));
  }

  return {
    start: () => add ('START'),
    add,
    done: () => add ('DONE'),
    report,
  };
}
