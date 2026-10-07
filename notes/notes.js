// The one list of notes. It feeds the Notes page, the count on the home page,
// and the "Next" link at the end of each note.
//
// To add a note: copy notes/slope-line-following.html, rename it, edit it,
// then add one entry here. Leave `href` empty until the note file exists.
// kind: "hard" = hardcoded adaptability, "learned" = learned adaptability.
window.SITE = {
  xUrl: '' // TODO: X profile or post URL, e.g. https://x.com/your-handle
};

window.NOTES = [
  {
    date: '[DATE]',
    title: 'Following a path on slopes, where the robot slips',
    project: 'RoboCupJunior Rescue',
    kind: 'hard',
    href: 'notes/slope-line-following.html'
  },
  {
    date: '[DATE]',
    title: 'The rescue robot needs to come alive fast when powered',
    project: 'RoboCup Rescue Robot League',
    kind: 'hard',
    href: ''
  },
  {
    date: '[DATE]',
    title: 'Seeing which way an object is turned, on a Jetson',
    project: 'NYU VIP, Engineer robot',
    kind: 'hard',
    href: ''
  },
  {
    date: '[DATE]',
    title: 'Letting a robot sort its own failures into types',
    project: 'Failure discovery research',
    kind: 'learned',
    href: ''
  }
];
