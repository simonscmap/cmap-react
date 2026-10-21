import handleXTicks from '../handleXTicks';

describe('handleXTicks', () => {
  it('labels unwrapped longitudes in the conventional range', () => {
    expect(handleXTicks({ lons: [170, 175, 180, 185, 190, 195, 200] })).toEqual({
      tickmode: 'array',
      tickvals: [170, 180, 190, 200],
      ticktext: ['170', '180', '-170', '-160'],
    });
  });

  it('samples large longitude grids without losing the final tick', () => {
    const lons = Array.from({ length: 145 }, (_, index) => 170 + index * 0.25);
    const ticks = handleXTicks({ lons });

    expect(ticks.tickvals[0]).toBe(170);
    expect(ticks.tickvals[ticks.tickvals.length - 1]).toBe(206);
    expect(ticks.ticktext[ticks.ticktext.length - 1]).toBe('-154');
    expect(ticks.tickvals.length).toBeLessThanOrEqual(7);
  });

  it('leaves ordinary and missing longitude axes to Plotly defaults', () => {
    expect(handleXTicks({ lons: [-10, 0, 10] })).toEqual({});
    expect(handleXTicks({})).toEqual({});
  });
});
