export const debugTimer = () => {
  const events = [];

  const add = (tag) => {
    events.push ({
      tag,
      time: Date.now(),
    });
  }

  const report = () => {
    console.log ('preparing report', events)
    if (events.length <= 0) {
      console.log ('no events to report');
      return;
    }

    const startIndex = events.findIndex ((e) => e.tag === 'START');
    const endIndex = events.findIndex((e) => e.tag === 'DONE');

    if (startIndex === -1 || endIndex === -1) {
      console.log ('timer missing start or end marker', events);
    }

    const events_ = events
      .slice (startIndex, endIndex + 1)

    const timeStart = events_[0].time;
    const elapsedTime = events_[events_.length - 1].time - timeStart;

    const results = events_.map ((ev, i) => {
      if (ev.tag !== 'DONE') {
        const duration = events_[i + 1].time - ev.time;
        const share = ((duration / elapsedTime) * 100).toFixed(2);
        const { tag } = ev;
        return {
          tag,
          duration: `${(duration / 1000).toFixed(2)}s`,
          share: `${share}%`,
        };
      } else {
        return ev;
      }
    });

    console.table (results.slice (0, results.length - 1));
  }

  return {
    start: () => add ('START'),
    add,
    done: () => add ('DONE'),
    report,
  };
}
