/**
 * ASL Sign Language Database
 * Comprehensive database of common ASL signs with hand shapes, positions, movements, and GIF URLs
 * GIFs sourced from public sign language resources
 */

const ASL_SIGN_DATABASE = {
  // Greeting & Basic
  'hello': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48600.mp4',
    description: 'Wave hello with a friendly salute from forehead'
  },
  'hi': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48600.mp4',
    description: 'Simple friendly wave'
  },
  'goodbye': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48760.mp4',
    description: 'Wave goodbye'
  },
  'bye': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48760.mp4',
    description: 'Quick friendly wave'
  },
  
  // Polite expressions
  'please': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48878.mp4',
    description: 'Polite request - hand circles on chest'
  },
  'thank': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48946.mp4',
    description: 'Gratitude - hand from chin moves forward'
  },
  'thanks': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48946.mp4',
    description: 'Express thanks - hand from chin forward'
  },
  'sorry': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48912.mp4',
    description: 'Apology - fist circles on heart area'
  },
  'welcome': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49190.mp4',
    description: 'Welcoming gesture - hands sweep inward'
  },
  
  // Yes/No
  'yes': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49212.mp4',
    description: 'Affirmative - fist nods up and down'
  },
  'no': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48834.mp4',
    description: 'Negative - fingers snap together'
  },
  'maybe': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48758.mp4',
    description: 'Uncertainty - hands alternate up and down'
  },
  
  // Pronouns
  'i': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48638.mp4',
    description: 'Point to yourself'
  },
  'me': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48756.mp4',
    description: 'Indicate yourself'
  },
  'you': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49206.mp4',
    description: 'Point to the other person'
  },
  'we': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49176.mp4',
    description: 'Circle from self to include others'
  },
  'they': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48940.mp4',
    description: 'Indicate a group of people'
  },
  
  // Question words
  'what': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49182.mp4',
    description: 'Question - hands shake with palms up'
  },
  'who': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49192.mp4',
    description: 'Asking about person - finger circles mouth'
  },
  'where': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49186.mp4',
    description: 'Asking location - finger shakes side to side'
  },
  'when': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49184.mp4',
    description: 'Asking about time - finger circles'
  },
  'why': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49196.mp4',
    description: 'Asking reason - hand from forehead moves away'
  },
  'how': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48616.mp4',
    description: 'Asking manner - fists roll forward'
  },
  
  // Common verbs
  'eat': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48534.mp4',
    description: 'Eating motion - fingers to mouth'
  },
  'drink': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48522.mp4',
    description: 'Drinking motion - cup to mouth'
  },
  'sleep': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48902.mp4',
    description: 'Sleeping - hand closes over face'
  },
  'go': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48578.mp4',
    description: 'Going - fingers point and move forward'
  },
  'come': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48458.mp4',
    description: 'Coming - fingers pull toward self'
  },
  'want': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49170.mp4',
    description: 'Desire - hands pull toward chest'
  },
  'need': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48818.mp4',
    description: 'Necessity - finger bends down repeatedly'
  },
  'help': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48606.mp4',
    description: 'Helping - one hand lifts the other'
  },
  'know': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48686.mp4',
    description: 'Knowledge - hand touches side of forehead'
  },
  'think': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48950.mp4',
    description: 'Thinking - finger circles at forehead'
  },
  'understand': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49132.mp4',
    description: 'Understanding - finger flicks up from forehead'
  },
  'learn': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48702.mp4',
    description: 'Hand moves from book to forehead'
  },
  'work': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49202.mp4',
    description: 'Fist taps on wrist'
  },
  'play': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48876.mp4',
    description: 'Y-hands shake side to side'
  },
  'like': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48712.mp4',
    description: 'Hand pulls from chest outward and closes'
  },
  'love': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48732.mp4',
    description: 'Both fists cross over heart'
  },
  'see': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48900.mp4',
    description: 'V-hand points from eyes forward'
  },
  'look': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48724.mp4',
    description: 'V-hand points from eyes forward'
  },
  'hear': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48610.mp4',
    description: 'Index finger points to ear'
  },
  'talk': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48938.mp4',
    description: 'Four fingers move from mouth outward'
  },
  'say': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48896.mp4',
    description: 'Index finger circles from mouth'
  },
  
  // Adjectives
  'good': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48582.mp4',
    description: 'Positive - hand from chin moves down'
  },
  'bad': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48454.mp4',
    description: 'Negative - hand from chin flips down'
  },
  'happy': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48604.mp4',
    description: 'Joy - hand circles upward on chest'
  },
  'sad': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48898.mp4',
    description: 'Sadness - hands move down face'
  },
  'tired': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48974.mp4',
    description: 'Bent hands droop down on chest'
  },
  'hot': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48622.mp4',
    description: 'Claw hand turns away from mouth quickly'
  },
  'cold': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48462.mp4',
    description: 'Fists shake at shoulders (shivering)'
  },
  'big': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48456.mp4',
    description: 'Hands move apart to show size'
  },
  'small': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48904.mp4',
    description: 'Hands move close together'
  },
  
  // Common nouns
  'water': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49180.mp4',
    description: 'W-hand taps chin'
  },
  'food': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48562.mp4',
    description: 'Fingers tap to mouth'
  },
  'home': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48614.mp4',
    description: 'Fingertips touch mouth, move to cheek'
  },
  'house': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48624.mp4',
    description: 'Hands form roof shape'
  },
  'school': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48894.mp4',
    description: 'Hands clap twice'
  },
  'family': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48540.mp4',
    description: 'F-hands circle to meet'
  },
  'friend': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48566.mp4',
    description: 'Index fingers hook together'
  },
  'mother': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48808.mp4',
    description: 'Open hand at chin, thumb touches chin'
  },
  'father': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48542.mp4',
    description: 'Open hand at forehead, thumb touches forehead'
  },
  'time': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48968.mp4',
    description: 'Index finger taps wrist (watch)'
  },
  'day': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48500.mp4',
    description: 'Index finger points up, arm moves down'
  },
  'night': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48828.mp4',
    description: 'Bent hand arcs over other arm'
  },
  'today': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48970.mp4',
    description: 'Y-hands drop down twice'
  },
  'tomorrow': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48972.mp4',
    description: 'A-hand thumbs forward from cheek'
  },
  'yesterday': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49214.mp4',
    description: 'A-hand thumbs backward from cheek'
  },
  
  // Feelings & States
  'fine': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48552.mp4',
    description: 'Open hand taps chest with thumb'
  },
  'ok': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48842.mp4',
    description: 'OK hand sign'
  },
  'great': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48588.mp4',
    description: 'Open hands move upward and apart'
  },
  'wonderful': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49200.mp4',
    description: 'Open hands push upward alternately'
  },
  
  // Common phrases components
  'are': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48442.mp4',
    description: 'Verb form - hand moves forward from mouth'
  },
  'is': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48442.mp4',
    description: 'Verb form - finger at mouth moves forward'
  },
  'am': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48442.mp4',
    description: 'Verb form - thumb touches chin'
  },
  'have': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48608.mp4',
    description: 'Bent hands pull to chest'
  },
  'has': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48608.mp4',
    description: 'Bent hands pull to chest'
  },
  'can': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48466.mp4',
    description: 'Fists move downward firmly'
  },
  'will': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/49198.mp4',
    description: 'Open hand moves from face forward (future)'
  },
  'do': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48520.mp4',
    description: 'Claw hands move side to side'
  },
  'make': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48740.mp4',
    description: 'Fists twist on each other'
  },
  'get': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48576.mp4',
    description: 'Open hands close into fists'
  },
  'give': {
    videoUrl: 'https://media.spreadthesign.com/video/mp4/13/48580.mp4',
    description: 'Open hand moves forward, palm up'
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ASL_SIGN_DATABASE;
}
