import Path from '../../src/geom/Path';

const assertPath = (path, expected) => {
  const value = path.commands.map(
    ({ command, args }) => `${command}:${args.join(',')}`
  );

  expect(value.join(`|`)).toBe(expected.replace(/\n| /g, ''));
};

describe('Path', () => {
  test('should construct empty path as default', () => {
    const path = new Path();

    expect(path.commands).toHaveLength(0);
  });

  test('should correctly inject moveTo function', () => {
    const path = new Path();

    expect(typeof path.moveTo).toEqual('function');
  });

  test('should correctly inject lineTo function', () => {
    const path = new Path();

    expect(typeof path.lineTo).toEqual('function');
  });

  test('should correctly inject quadraticCurveTo function', () => {
    const path = new Path();

    expect(typeof path.quadraticCurveTo).toEqual('function');
  });

  test('should correctly inject bezierCurveTo function', () => {
    const path = new Path();

    expect(typeof path.bezierCurveTo).toEqual('function');
  });

  test('should correctly inject closePath function', () => {
    const path = new Path();

    expect(typeof path.closePath).toEqual('function');
  });

  test('should correctly add rect commands', () => {
    const path = new Path();
    path.rect(5, 5, 10, 20);

    assertPath(
      path,
      'moveTo:5,5|lineTo:15,5|lineTo:15,25|lineTo:5,25|closePath:'
    );
  });

  test('should correctly add ellipse commands', () => {
    const path = new Path();
    path.ellipse(5, 5, 10, 20);

    assertPath(
      path,
      `moveTo:-5,5|bezierCurveTo:-5,-6.045694996615872,-0.5228474983079359,
      -15,5,-15|bezierCurveTo:10.522847498307936,-15,15,-6.045694996615872,
      15,5|bezierCurveTo:15,16.04569499661587,10.522847498307936,25,5,25
      |bezierCurveTo:-0.5228474983079359,25,-5,16.04569499661587,
      -5,5|closePath:`
    );
  });

  test('should correctly add cicle commands', () => {
    const path = new Path();
    path.circle(5, 5, 10);

    assertPath(
      path,
      `moveTo:-5,5|bezierCurveTo:-5,-0.5228474983079359,-0.5228474983079359,
      -5,5,-5|bezierCurveTo:10.522847498307936,-5,15,-0.5228474983079359,15,5|
      bezierCurveTo:15,10.522847498307936,10.522847498307936,15,5,15|
      bezierCurveTo:-0.5228474983079359,15,-5,10.522847498307936,
      -5,5|closePath:`
    );
  });
});
