import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing data in correct order
  console.log('Cleaning existing database records...');
  await prisma.set.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.pRRecord.deleteMany();
  await prisma.review.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing database records cleared.');

  // 2. Seed Gyms & Trainers
  console.log('Seeding gyms and trainers...');
  
  const gym1 = await prisma.gym.create({
    data: {
      name: "Gold's Gym",
      city: "Mumbai",
      address: "101, Bandra West, Near Link Road, Mumbai, Maharashtra 400050",
      fee: 2500,
      rating: 4.5,
      amenities: ["AC", "Parking", "Sauna"],
      trainers: {
        create: [
          {
            name: "Rahul Sharma",
            phone: "+91 9876543210",
            specialization: "Bodybuilding & Strength",
            fee: 1500,
            experience: 8,
          },
          {
            name: "Pooja Patel",
            phone: "+91 8765432109",
            specialization: "Weight Loss & Functional",
            fee: 1200,
            experience: 5,
          }
        ]
      }
    }
  });

  const gym2 = await prisma.gym.create({
    data: {
      name: "Powerhouse Fitness",
      city: "Mumbai",
      address: "Opposite Metro Station, Andheri East, Mumbai, Maharashtra 400069",
      fee: 1200,
      rating: 3.8,
      amenities: ["AC", "Parking"],
      trainers: {
        create: [
          {
            name: "Vikram Rathore",
            phone: "+91 7654321098",
            specialization: "Powerlifting & General Fitness",
            fee: 800,
            experience: 6,
          }
        ]
      }
    }
  });

  const gym3 = await prisma.gym.create({
    data: {
      name: "Cult Fit Elite",
      city: "Bangalore",
      address: "12th Main Rd, HAL 2nd Stage, Indiranagar, Bangalore, Karnataka 560038",
      fee: 3500,
      rating: 4.8,
      amenities: ["AC", "Pool", "Sauna", "Parking"],
      trainers: {
        create: [
          {
            name: "Karan Johar",
            phone: "+91 6543210987",
            specialization: "HIIT, Yoga, & Crossfit",
            fee: 2000,
            experience: 10,
          },
          {
            name: "Anjali Rao",
            phone: "+91 5432109876",
            specialization: "Pilates & Core Conditioning",
            fee: 1800,
            experience: 7,
          }
        ]
      }
    }
  });

  const gym4 = await prisma.gym.create({
    data: {
      name: "Metro Gym",
      city: "Delhi",
      address: "B-42, Connaught Place, New Delhi, Delhi 110001",
      fee: 999,
      rating: 3.5,
      amenities: ["AC"],
      trainers: {
        create: [] // No trainers
      }
    }
  });

  const gym5 = await prisma.gym.create({
    data: {
      name: "Olympia Fitness Studio",
      city: "Delhi",
      address: "M-Block, Greater Kailash 1, New Delhi, Delhi 110048",
      fee: 4500,
      rating: 4.7,
      amenities: ["AC", "Pool", "Parking"],
      trainers: {
        create: [
          {
            name: "Amit Singhal",
            phone: "+91 4321098765",
            specialization: "Athletic Conditioning",
            fee: 2500,
            experience: 12,
          }
        ]
      }
    }
  });

  console.log(`Seeded 5 gyms: ${gym1.name}, ${gym2.name}, ${gym3.name}, ${gym4.name}, ${gym5.name}`);

  // 4. Seed Exercises
  console.log('Seeding exercise library...');
  const exercises = [
    // --- CHEST ---
    {
      name: "Barbell Bench Press",
      muscleGroups: ["chest", "triceps", "shoulders"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025.gif",
      formSteps: [
        "Lie flat on the bench, feet flat on the floor.",
        "Grip the barbell slightly wider than shoulder-width.",
        "Unrack the bar and lower it slowly to your mid-chest.",
        "Push the bar back up powerfully until your arms are fully extended."
      ],
      commonMistakes: ["Bouncing the bar off your chest.", "Flaring your elbows out too wide."],
      proTips: ["Squeeze your shoulder blades together and keep your feet driven into the floor."],
      breathingCue: "Inhale on the way down, exhale as you push up."
    },
    {
      name: "Push-Up",
      muscleGroups: ["chest", "shoulders", "triceps", "core"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0662.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0662.gif",
      formSteps: [
        "Start in a high plank position, hands slightly wider than shoulder-width.",
        "Lower your body until your chest nearly touches the floor, keeping your elbows tucked.",
        "Push back up to the starting position."
      ],
      commonMistakes: ["Sagging hips or arched lower back.", "Elbows flared out to 90 degrees."],
      proTips: ["Keep your core and glutes engaged throughout the entire movement."],
      breathingCue: "Inhale on the way down, exhale on the way up."
    },
    {
      name: "Incline Dumbbell Press",
      muscleGroups: ["chest", "shoulders", "triceps"],
      difficulty: "Intermediate",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0314.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0314.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0314.gif",
      formSteps: [
        "Set an incline bench to 30-45 degrees.",
        "Press the dumbbells up above your chest with a neutral/pronated grip.",
        "Lower the weights slowly to the sides of your upper chest.",
        "Push them back up to the starting position."
      ],
      commonMistakes: ["Using too steep of an incline, targeting front delts instead.", "Clashing dumbbells at the top."],
      proTips: ["Keep your wrists straight and drive the weights up in a slight arch."],
      breathingCue: "Inhale as you lower, exhale as you press."
    },
    {
      name: "Dumbbell Chest Fly",
      muscleGroups: ["chest"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0308.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0308.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0308.gif",
      formSteps: [
        "Lie flat on a bench holding dumbbells above your chest with palms facing each other.",
        "With a slight bend in your elbows, lower your arms out to the sides in a wide arc.",
        "Squeeze your chest muscles to bring the dumbbells back to the starting position."
      ],
      commonMistakes: ["Bending elbows too much, turning it into a press.", "Lowering weights past shoulder level."],
      proTips: ["Focus on the stretch at the bottom and contract your chest hard at the top."],
      breathingCue: "Inhale on the way down, exhale on the way up."
    },
    {
      name: "Chest Dips",
      muscleGroups: ["chest", "triceps", "shoulders"],
      difficulty: "Advanced",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0251.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0251.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0251.gif",
      formSteps: [
        "Grab parallel bars and lift your body up.",
        "Lean your torso slightly forward and bend your knees.",
        "Lower your body by bending your elbows until your shoulders are below your elbows.",
        "Push back up to return to the starting position."
      ],
      commonMistakes: ["Keeping the torso upright, targeting triceps instead.", "Going too deep, straining shoulders."],
      proTips: ["Cross your feet and squeeze your abs to stay stable."],
      breathingCue: "Inhale as you lower, exhale as you push up."
    },

    // --- BACK ---
    {
      name: "Pull-Up",
      muscleGroups: ["back", "biceps", "core", "forearms"],
      difficulty: "Intermediate",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0652.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0652.gif",
      formSteps: [
        "Hang from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width.",
        "Pull your body up until your chin clears the bar.",
        "Lower yourself slowly back to the starting hanging position."
      ],
      commonMistakes: ["Using momentum or swinging/kicking your legs.", "Not going all the way down to a dead hang."],
      proTips: ["Lead with your elbows and squeeze your shoulder blades at the top."],
      breathingCue: "Exhale as you pull up, inhale as you lower."
    },
    {
      name: "Barbell Row",
      muscleGroups: ["back", "biceps", "forearms", "core"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0027.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0027.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0027.gif",
      formSteps: [
        "Hold a barbell with a pronated grip and hinge at your hips, keeping your back flat.",
        "Pull the barbell toward your lower chest / upper abdomen.",
        "Lower the bar back down to the starting position in a controlled manner."
      ],
      commonMistakes: ["Rounding the lower back.", "Using momentum by standing up during the row."],
      proTips: ["Keep your neck in a neutral position, looking slightly ahead of you."],
      breathingCue: "Exhale as you pull, inhale as you lower the bar."
    },
    {
      name: "Lat Pulldown",
      muscleGroups: ["back", "biceps"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0177.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0177.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0177.gif",
      formSteps: [
        "Sit at a pulldown station and grip the wide bar with an overhand grip.",
        "Pull the bar down to your upper chest while leaning slightly back.",
        "Release the bar slowly back to the starting position."
      ],
      commonMistakes: ["Pulling the bar behind your neck.", "Using too much body weight to rock back."],
      proTips: ["Keep your chest high and drive your elbows down towards your hips."],
      breathingCue: "Exhale as you pull down, inhale as you return."
    },
    {
      name: "Deadlift",
      muscleGroups: ["back", "glutes", "hamstrings", "forearms", "full body"],
      difficulty: "Advanced",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032.gif",
      formSteps: [
        "Stand with mid-foot under the barbell. Bend over and grab the bar with a shoulder-width grip.",
        "Bend your knees until your shins touch the bar, keeping your back flat.",
        "Stand up tall, pulling the weight off the floor, locking out your hips and knees.",
        "Return the bar to the floor by hinging at the hips first, then bending knees."
      ],
      commonMistakes: ["Rounding the spine during the lift.", "Starting with the bar too far from the shins."],
      proTips: ["Engage your lats to keep the bar close, and push the floor away with your feet."],
      breathingCue: "Inhale at the bottom, brace core, exhale as you lock out."
    },
    {
      name: "Dumbbell Single-Arm Row",
      muscleGroups: ["back", "biceps", "forearms"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0292.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0292.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0292.gif",
      formSteps: [
        "Place one knee and one hand on a flat bench for support.",
        "Hold a dumbbell in your opposite hand with your arm extended downwards.",
        "Row the dumbbell up to your hip crease, keeping your elbow tucked.",
        "Lower the weight back down in a controlled motion."
      ],
      commonMistakes: ["Rotating the torso too much.", "Pulling the dumbbell to the chest rather than the hip."],
      proTips: ["Focus on driving the elbow backward to maximize lat activation."],
      breathingCue: "Exhale as you row, inhale as you lower."
    },

    // --- SHOULDERS ---
    {
      name: "Overhead Press (Barbell)",
      muscleGroups: ["shoulders", "triceps", "core"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0071.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0071.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0071.gif",
      formSteps: [
        "Hold the barbell on your front shoulders, hands slightly wider than shoulder-width.",
        "Press the bar overhead in a straight line, locking out your elbows.",
        "Lower the bar back down to your collarbone in a controlled manner."
      ],
      commonMistakes: ["Excessive arching of the lower back.", "Not locking out at the top."],
      proTips: ["Squeeze your glutes and brace your abs to prevent back arching."],
      breathingCue: "Inhale and brace at the bottom, press, and exhale at the top."
    },
    {
      name: "Dumbbell Lateral Raise",
      muscleGroups: ["shoulders"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0336.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0336.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0336.gif",
      formSteps: [
        "Stand tall with dumbbells at your sides, palms facing in.",
        "Raise your arms out to the sides until they are parallel to the floor, with a slight elbow bend.",
        "Lower the weights back down slowly to the starting position."
      ],
      commonMistakes: ["Using too much weight and swinging the torso.", "Leading with the hands instead of the elbows."],
      proTips: ["Pour the 'pitcher' at the top by tilting dumbbells slightly forward."],
      breathingCue: "Exhale as you raise, inhale as you lower."
    },
    {
      name: "Dumbbell Shoulder Press",
      muscleGroups: ["shoulders", "triceps"],
      difficulty: "Intermediate",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0382.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0382.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0382.gif",
      formSteps: [
        "Sit on a bench with back support, holding dumbbells at shoulder height with palms facing forward.",
        "Press the weights overhead until your arms are fully extended.",
        "Lower the dumbbells slowly back to the starting position."
      ],
      commonMistakes: ["Flaring elbows out too much.", "Arching the lower back excessively."],
      proTips: ["Keep your elbows slightly tucked forward at a 30-degree angle (scapular plane)."],
      breathingCue: "Exhale as you press, inhale as you lower."
    },
    {
      name: "Front Dumbbell Raise",
      muscleGroups: ["shoulders"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0310.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0310.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0310.gif",
      formSteps: [
        "Stand tall with dumbbells resting on the front of your thighs.",
        "Raise one dumbbell (or both) straight in front of you until it is parallel to the floor.",
        "Lower it under control, then repeat with the other arm."
      ],
      commonMistakes: ["Using body momentum to swing the weights up.", "Shrugging the shoulders up during the raise."],
      proTips: ["Squeeze your core and maintain a slight bend in the knees for stability."],
      breathingCue: "Exhale as you raise, inhale as you lower."
    },
    {
      name: "Face Pull",
      muscleGroups: ["shoulders", "back"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1264.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1264.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1264.gif",
      formSteps: [
        "Attach a rope to a cable pulley set at upper-chest height.",
        "Grip the rope handles with your thumbs facing backward, step back to create tension.",
        "Pull the center of the rope towards your nose, flaring your elbows and squeezing your rear delts.",
        "Return slowly to the starting position."
      ],
      commonMistakes: ["Pulling too low towards the chin or chest.", "Using too much weight, causing poor posture."],
      proTips: ["Focus on external rotation at the end of the pull, like doing a double-bicep pose."],
      breathingCue: "Exhale as you pull, inhale as you return."
    },

    // --- BICEPS ---
    {
      name: "Dumbbell Bicep Curl",
      muscleGroups: ["biceps", "forearms"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0294.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0294.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0294.gif",
      formSteps: [
        "Stand tall holding dumbbells at your sides, palms facing forward.",
        "Squeeze biceps to curl the weights up, keeping your elbows locked in place.",
        "Lower the dumbbells slowly back to full extension."
      ],
      commonMistakes: ["Swinging the elbows forward or using momentum.", "Not completing the full range of motion."],
      proTips: ["Keep your chest up and shoulders back to isolate the bicep."],
      breathingCue: "Exhale as you curl, inhale as you lower."
    },
    {
      name: "Hammer Curl",
      muscleGroups: ["biceps", "forearms"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0322.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0322.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0322.gif",
      formSteps: [
        "Stand holding dumbbells with a neutral grip (palms facing each other).",
        "Curl the weights up while keeping your palms facing each other.",
        "Lower the weights slowly back to the start."
      ],
      commonMistakes: ["Moving the elbows away from the body.", "Wrist flexion during the curl."],
      proTips: ["This exercise targets the brachialis and brachioradialis (forearms)."],
      breathingCue: "Exhale on the curl, inhale on the descent."
    },
    {
      name: "Barbell Curl",
      muscleGroups: ["biceps", "forearms"],
      difficulty: "Beginner",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0031.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0031.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0031.gif",
      formSteps: [
        "Stand with feet shoulder-width apart, holding a barbell with an underhand grip.",
        "Keep your elbows tucked near your torso and curl the bar up toward your shoulders.",
        "Lower the bar slowly under control to the starting position."
      ],
      commonMistakes: ["Arching the back to lift the weight.", "Letting the elbows drift forward too much."],
      proTips: ["Keep your wrists straight and squeeze your biceps hard at the top."],
      breathingCue: "Exhale as you curl up, inhale as you lower."
    },
    {
      name: "Preacher Curl",
      muscleGroups: ["biceps"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0085.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0085.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0085.gif",
      formSteps: [
        "Sit at a preacher bench and rest the back of your upper arms on the pad.",
        "Grip an EZ-bar with an underhand grip.",
        "Curl the bar up toward your face, keeping your upper arms flat on the pad.",
        "Lower the weight slowly until your arms are fully extended."
      ],
      commonMistakes: ["Lifting the armpits off the pad.", "Not using a full range of motion to avoid extension."],
      proTips: ["Perform the lower half of the movement slowly to prevent strain on the bicep tendon."],
      breathingCue: "Exhale as you curl, inhale as you lower."
    },
    {
      name: "Concentration Curl",
      muscleGroups: ["biceps"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0299.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0299.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0299.gif",
      formSteps: [
        "Sit on a flat bench, feet wide. Hold a dumbbell in one hand.",
        "Rest the elbow of that arm against the inside of your thigh.",
        "Curl the dumbbell up toward your shoulder, keeping your elbow stable against your thigh.",
        "Lower the dumbbell slowly to the starting position."
      ],
      commonMistakes: ["Using leg movement to assist the curl.", "Curling the weight straight up instead of toward the shoulder."],
      proTips: ["Squeeze the bicep peak at the top of the contraction for a full second."],
      breathingCue: "Exhale as you curl, inhale as you lower."
    },

    // --- TRICEPS ---
    {
      name: "Skull Crushers",
      muscleGroups: ["triceps"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0060.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0060.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0060.gif",
      formSteps: [
        "Lie flat on a bench holding an EZ bar or barbell directly above your shoulders.",
        "Bend your elbows to lower the bar toward your forehead, keeping upper arms stationary.",
        "Press the bar back up to the starting position."
      ],
      commonMistakes: ["Allowing the elbows to flare out to the sides.", "Moving the upper arms back and forth."],
      proTips: ["Keep your elbows pointing straight forward throughout the lift."],
      breathingCue: "Inhale on the way down, exhale as you extend."
    },
    {
      name: "Tricep Rope Pushdown",
      muscleGroups: ["triceps"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0241.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0241.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0241.gif",
      formSteps: [
        "Stand facing a cable machine, holding rope handles with neutral grip.",
        "Pin your elbows to the sides of your ribcage.",
        "Extend your arms fully downward, spreading the rope ends apart at the bottom.",
        "Squeeze your triceps, then slowly return to the starting position."
      ],
      commonMistakes: ["Letting the elbows flare out or drift forward.", "Leaning too far forward, using chest weight."],
      proTips: ["Lock your shoulder blades back and down for absolute triceps isolation."],
      breathingCue: "Exhale as you push down, inhale as you return."
    },
    {
      name: "Overhead Dumbbell Tricep Extension",
      muscleGroups: ["triceps"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0430.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0430.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0430.gif",
      formSteps: [
        "Sit or stand, holding one dumbbell with both hands vertically overhead.",
        "Lower the weight behind your head by bending only your elbows.",
        "Extend your elbows to press the dumbbell back to the starting position."
      ],
      commonMistakes: ["Elbows flaring widely outwards.", "Arching the lower back excessively."],
      proTips: ["Keep your core braced and your upper arms vertical next to your ears."],
      breathingCue: "Inhale as you lower, exhale as you press up."
    },
    {
      name: "Close-Grip Bench Press",
      muscleGroups: ["triceps", "chest", "shoulders"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0030.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0030.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0030.gif",
      formSteps: [
        "Lie flat on a bench, gripping the barbell with hands about shoulder-width apart.",
        "Lower the bar slowly to your lower chest, keeping your elbows tucked close to your torso.",
        "Press the bar back up powerfully to complete lockout."
      ],
      commonMistakes: ["Holding the bar with hands too close (less than 6 inches), straining wrists.", "Flaring elbows."],
      proTips: ["This is a phenomenal builder for both triceps mass and bench press lockouts."],
      breathingCue: "Inhale on the way down, exhale as you press up."
    },
    {
      name: "Bench Dips",
      muscleGroups: ["triceps", "shoulders", "chest"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0136.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0136.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0136.gif",
      formSteps: [
        "Place your hands on the edge of a flat bench behind you, feet extended forward.",
        "Lower your hips by bending your elbows to a 90-degree angle.",
        "Push back up through your palms until arms are fully straight."
      ],
      commonMistakes: ["Letting the hips drift too far forward away from the bench.", "Shrugging the shoulders up."],
      proTips: ["Keep your back close to the bench to prevent shoulder hyperextension."],
      breathingCue: "Inhale as you lower, exhale as you push up."
    },

    // --- FOREARMS ---
    {
      name: "Wrist Curls",
      muscleGroups: ["forearms"],
      difficulty: "Beginner",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0062.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0062.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0062.gif",
      formSteps: [
        "Sit on a bench, resting your forearms on your thighs, holding a barbell palms-up.",
        "Let the bar roll down into your fingers, then curl your wrists upward.",
        "Lower the bar slowly back to the starting position."
      ],
      commonMistakes: ["Lifting forearms off the thighs.", "Using too much weight, straining wrist joint."],
      proTips: ["Move slowly to target the deep flexors of the forearm."],
      breathingCue: "Exhale on curl up, inhale as you roll down."
    },
    {
      name: "Reverse Grip Barbell Curl",
      muscleGroups: ["forearms", "biceps"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0090.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0090.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0090.gif",
      formSteps: [
        "Stand tall, holding a barbell with an overhand (pronated) grip.",
        "Keep your elbows tucked and curl the barbell up towards your shoulders.",
        "Lower the barbell slowly back to full extension."
      ],
      commonMistakes: ["Letting the wrists sag or bend backward.", "Using body swing to raise the bar."],
      proTips: ["Squeeze the bar tightly to maximize forearm extensor activation."],
      breathingCue: "Exhale as you curl up, inhale as you lower."
    },
    {
      name: "Behind-the-Back Wrist Curl",
      muscleGroups: ["forearms"],
      difficulty: "Beginner",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0026.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0026.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0026.gif",
      formSteps: [
        "Stand holding a barbell behind your thighs with an overhand grip (palms facing away).",
        "Allow the barbell to roll down to your fingertips.",
        "Curl your wrists upward, raising the bar, squeezing the forearms.",
        "Lower back down slowly."
      ],
      commonMistakes: ["Bending the elbows, making it a cheat curl.", "Moving the head forward."],
      proTips: ["Excellent for targeting the wrist flexors while keeping stress off the wrists."],
      breathingCue: "Exhale on the way up, inhale on the way down."
    },
    {
      name: "Farmer's Walk",
      muscleGroups: ["forearms", "core", "full body"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2133.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2133.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2133.gif",
      formSteps: [
        "Stand between two heavy dumbbells and lift them up with a neutral grip.",
        "Keep your chest high, shoulders pulled back, and core braced.",
        "Take short, quick steps and walk a straight line for a set distance or time."
      ],
      commonMistakes: ["Slouching the shoulders forward.", "Looking down at your feet instead of forward."],
      proTips: ["Focus on crushing the dumbbell handles to maximize grip endurance."],
      breathingCue: "Maintain short, rhythmic, braced breathing."
    },
    {
      name: "Plate Pinch Hold",
      muscleGroups: ["forearms"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg",
      imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg",
      videoUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg",
      formSteps: [
        "Place two weight plates together, smooth sides facing out.",
        "Grip the plates near the top using only your fingers and thumb (pinch grip).",
        "Lift the plates off the floor and hold them by your sides for time.",
        "Repeat with the other hand."
      ],
      commonMistakes: ["Resting the plates against the legs.", "Curling the fingers under the plate rims."],
      proTips: ["Keep your thumb active; thumb strength is key to a powerful pinch grip."],
      breathingCue: "Breathe slowly and steadily throughout the hold."
    },

    // --- QUADS ---
    {
      name: "Barbell Squat",
      muscleGroups: ["quads", "glutes", "hamstrings", "calves", "core"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0043.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0043.gif",
      formSteps: [
        "Rest the barbell on your upper back / traps.",
        "Stand with feet shoulder-width apart, toes pointed slightly out.",
        "Lower your hips down and back, keeping your chest upright, until thighs are parallel to the floor.",
        "Drive through your heels to return to a standing position."
      ],
      commonMistakes: ["Knees caving inwards.", "Heels lifting off the ground.", "Rounding your lower back."],
      proTips: ["Keep your head neutral and core tight as if you are about to be braced."],
      breathingCue: "Inhale on the descent, exhale as you rise."
    },
    {
      name: "Leg Press",
      muscleGroups: ["quads", "glutes", "hamstrings"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0739.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0739.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0739.gif",
      formSteps: [
        "Sit on the leg press machine and place feet shoulder-width apart on the platform.",
        "Release the safety catches and lower the platform slowly toward your chest.",
        "Press the platform back up, without locking out your knees."
      ],
      commonMistakes: ["Locking out the knees at the top.", "Lifting the lower back off the pad."],
      proTips: ["Set your feet higher on the platform to focus more on the glutes and hamstrings."],
      breathingCue: "Inhale as you lower, exhale as you press."
    },
    {
      name: "Bulgarian Split Squat",
      muscleGroups: ["quads", "hamstrings", "glutes"],
      difficulty: "Intermediate",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0095.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0095.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0095.gif",
      formSteps: [
        "Place one foot flat behind you on a bench, and hold dumbbells at your sides.",
        "Lower your body down until your back knee is just above the floor.",
        "Drive through your front heel to stand back up."
      ],
      commonMistakes: ["Leaning too far forward.", "Having the front foot too close to the bench."],
      proTips: ["This is excellent for correcting single-leg imbalances."],
      breathingCue: "Inhale on the way down, exhale on the way up."
    },
    {
      name: "Leg Extension",
      muscleGroups: ["quads"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0585.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0585.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0585.gif",
      formSteps: [
        "Adjust the leg extension machine so the pad sits comfortably on the lower shins.",
        "Grip the side handles and extend your legs fully, contracting your quads.",
        "Lower the weight back down slowly under control."
      ],
      commonMistakes: ["Lifting the hips off the seat.", "Bouncing the weight up using momentum."],
      proTips: ["Point your toes slightly outward or inward to target different sections of the quad."],
      breathingCue: "Exhale as you extend, inhale as you lower."
    },
    {
      name: "Goblet Squat",
      muscleGroups: ["quads", "glutes", "core"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1760.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1760.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1760.gif",
      formSteps: [
        "Hold a single dumbbell vertically against your chest, cupping the top head in both hands.",
        "Position your feet shoulder-width apart, toes pointed slightly out.",
        "Squat down by pushing your hips back and bending your knees, keeping your elbows inside your knees.",
        "Drive back up to the starting position."
      ],
      commonMistakes: ["Allowing the knees to cave inward.", "Rounding the upper back or dropping the chest."],
      proTips: ["Use your elbows to push your knees out at the bottom of the squat."],
      breathingCue: "Inhale on the way down, exhale on the way up."
    },

    // --- HAMSTRINGS ---
    {
      name: "Lying Leg Curl",
      muscleGroups: ["hamstrings"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0586.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0586.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0586.gif",
      formSteps: [
        "Lie face down on the leg curl machine, pads resting behind your ankles.",
        "Curl your legs up toward your glutes as far as possible.",
        "Lower the weight slowly back to the starting position."
      ],
      commonMistakes: ["Arching the lower back off the bench.", "Using momentum to swing the weight."],
      proTips: ["Keep your hips pushed firmly down into the pad."],
      breathingCue: "Exhale on curl up, inhale as you release."
    },
    {
      name: "Romanian Deadlift",
      muscleGroups: ["hamstrings", "glutes", "back"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0085.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0085.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0085.gif",
      formSteps: [
        "Stand tall holding a barbell with a shoulder-width grip.",
        "Hinge at your hips and lower the bar, keeping it close to your thighs and knees.",
        "Push your hips back as far as possible until you feel a deep stretch in the hamstrings.",
        "Drive your hips forward and return to the starting position."
      ],
      commonMistakes: ["Rounding the spine.", "Bending the knees too much, turning it into a squat."],
      proTips: ["Initiate the movement by pushing the hips backward, not by lowering the chest."],
      breathingCue: "Inhale on descent, exhale as you stand up."
    },
    {
      name: "Seated Leg Curl",
      muscleGroups: ["hamstrings"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0599.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0599.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0599.gif",
      formSteps: [
        "Sit on the machine, adjust the thigh support pad securely, ankles resting on the lower rollers.",
        "Curl your legs downward and backward toward your seat.",
        "Return slowly to the starting position with legs straight."
      ],
      commonMistakes: ["Slouching in the seat.", "Allowing the thighs to lift off the support."],
      proTips: ["Flex your ankles (pull toes up) to maximize hamstring tension."],
      breathingCue: "Exhale as you curl down, inhale as you release."
    },
    {
      name: "Nordic Hamstring Curl",
      muscleGroups: ["hamstrings", "glutes"],
      difficulty: "Advanced",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0016.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0016.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0016.gif",
      formSteps: [
        "Kneel on a padded surface, with your ankles secured by a partner or an anchor.",
        "Keep your torso straight from head to knee, and lower yourself slowly toward the floor.",
        "Control the descent as much as possible using your hamstrings.",
        "Push off the floor gently to assist yourself back to the starting kneeling position."
      ],
      commonMistakes: ["Bending at the hips (hinging).", "Dropping straight down without controlling the descent."],
      proTips: ["Try to control the descent for at least 3 to 5 seconds."],
      breathingCue: "Inhale on the way down, exhale as you push up."
    },
    {
      name: "Glute Ham Raise",
      muscleGroups: ["hamstrings", "glutes", "back"],
      difficulty: "Advanced",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
      imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
      videoUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
      formSteps: [
        "Position yourself on the GHD machine with ankles locked and knees on the pad.",
        "Start with your torso upright, then lower your body forward until it is horizontal.",
        "Pull yourself back up by flexing the knees and contracting the hamstrings.",
        "Return to the vertical position."
      ],
      commonMistakes: ["Hinging at the waist.", "Using too much upper-body momentum."],
      proTips: ["Keep your glutes contracted throughout the entire movement."],
      breathingCue: "Inhale on the way down, exhale on the way up."
    },

    // --- GLUTES ---
    {
      name: "Barbell Hip Thrust",
      muscleGroups: ["glutes", "hamstrings"],
      difficulty: "Intermediate",
      equipment: "Barbell",
      gifUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
      imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
      videoUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
      formSteps: [
        "Sit on the floor with your upper back resting against a flat bench, barbell across your hips.",
        "Drive through your heels, extending your hips upward until they are level with your torso.",
        "Squeeze your glutes hard at the top lockout.",
        "Lower your hips slowly back to the starting position."
      ],
      commonMistakes: ["Hyperextending the lower back at the top.", "Pushing through the toes instead of the heels."],
      proTips: ["Keep your chin tucked forward and look straight ahead throughout the movement."],
      breathingCue: "Inhale as you lower, exhale as you drive up."
    },
    {
      name: "Cable Kickback",
      muscleGroups: ["glutes"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0860.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0860.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0860.gif",
      formSteps: [
        "Attach an ankle cuff to a low cable pulley.",
        "Facing the machine, hinge forward slightly, holding the frame for support.",
        "Drive your leg backward, squeezing the glute at the peak extension.",
        "Return your leg slowly to the starting position."
      ],
      commonMistakes: ["Arching the lower back to get the leg higher.", "Swinging the leg with momentum."],
      proTips: ["Keep your torso stationary; all movement should happen at the hip joint."],
      breathingCue: "Exhale as you kick back, inhale as you return."
    },
    {
      name: "Glute Bridge",
      muscleGroups: ["glutes", "hamstrings"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1409.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1409.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1409.gif",
      formSteps: [
        "Lie flat on your back, knees bent, feet flat on the floor about hip-width apart.",
        "Drive through your heels to lift your hips, squeezing your glutes.",
        "Ensure your body forms a straight line from shoulders to knees.",
        "Lower back down slowly."
      ],
      commonMistakes: ["Arching the lower back too much.", "Lifting the shoulders off the floor."],
      proTips: ["Perform a posterior pelvic tilt before lifting to isolate the glutes."],
      breathingCue: "Exhale as you lift, inhale as you lower."
    },
    {
      name: "Walking Lunges",
      muscleGroups: ["glutes", "quads", "hamstrings"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1460.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1460.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1460.gif",
      formSteps: [
        "Stand tall holding dumbbells in each hand by your sides.",
        "Step forward with one leg, lowering your hips until your back knee is just above the floor.",
        "Drive through your front heel, stepping forward with the back leg to stand up.",
        "Repeat on the opposite side, walking forward."
      ],
      commonMistakes: ["Letting the front knee collapse inward.", "Stepping with too narrow of a stance, losing balance."],
      proTips: ["Lean your torso slightly forward to shift more load to the glutes."],
      breathingCue: "Inhale as you lower, exhale as you step up."
    },
    {
      name: "Fire Hydrants",
      muscleGroups: ["glutes"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1774.gif",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500&auto=format&fit=crop",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1774.gif",
      formSteps: [
        "Start on all fours, wrists under shoulders and knees under hips.",
        "Keeping your knee bent at 90 degrees, raise your leg out to the side.",
        "Lower your leg back to the starting position."
      ],
      commonMistakes: ["Shifting your entire torso to the side.", "Rounding your back."],
      proTips: ["This is a fantastic exercise for isolating the gluteus medius."],
      breathingCue: "Exhale as you raise the leg, inhale as you lower."
    },

    // --- CALVES ---
    {
      name: "Standing Calf Raise",
      muscleGroups: ["calves"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1372.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1372.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1372.gif",
      formSteps: [
        "Adjust the shoulder pads of the machine and stand with the balls of your feet on the block.",
        "Lower your heels as far as possible to get a deep stretch.",
        "Raise up on your toes as high as possible, squeezing the calf muscles."
      ],
      commonMistakes: ["Bending the knees, which makes it a squat.", "Bouncing at the bottom stretch."],
      proTips: ["Pause for 1 second at the bottom stretch and 1 second at the top squeeze."],
      breathingCue: "Exhale as you raise, inhale as you lower."
    },
    {
      name: "Seated Calf Raise",
      muscleGroups: ["calves"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0088.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0088.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0088.gif",
      formSteps: [
        "Sit on the machine, resting thighs under the pads and balls of feet on the block.",
        "Lower your heels down for a full stretch, then press up high on your toes.",
        "Repeat for reps."
      ],
      commonMistakes: ["Fast reps without holding the contraction.", "Using arms to lift the weight."],
      proTips: ["This targets the soleus muscle, located beneath the gastrocnemius."],
      breathingCue: "Exhale on toe press, inhale on heel lower."
    },
    {
      name: "Donkey Calf Raise",
      muscleGroups: ["calves"],
      difficulty: "Intermediate",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0284.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0284.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0284.gif",
      formSteps: [
        "Hinge forward at the waist and rest your arms on the support pads.",
        "Place the balls of your feet on the calf block with heels hanging off.",
        "Lower your heels for a stretch, then drive up on the balls of your feet."
      ],
      commonMistakes: ["Bending the knees.", "Incomplete stretch."],
      proTips: ["Excellent for isolating the gastrocnemius calf muscle."],
      breathingCue: "Exhale as you press up, inhale down."
    },
    {
      name: "Calf Press on Leg Press",
      muscleGroups: ["calves"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1391.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1391.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1391.gif",
      formSteps: [
        "Sit in a leg press machine, place the balls of your feet on the lower edge of the platform.",
        "Press the platform away, then release safety handles.",
        "Extend your ankles to press the platform, then lower back to feel a stretch in the calves.",
        "Repeat for reps."
      ],
      commonMistakes: ["Bending and extending the knees.", "Letting the feet slip off the platform."],
      proTips: ["Keep a tiny micro-bend in the knees to prevent joint strain, but keep them locked in place."],
      breathingCue: "Exhale as you press, inhale as you lower."
    },
    {
      name: "Single Leg Standing Calf Raise",
      muscleGroups: ["calves"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0409.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0409.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0409.gif",
      formSteps: [
        "Stand on one foot on a raised block, letting the heel hang off the edge.",
        "Hold onto a wall or rack for balance.",
        "Lower your heel down as far as possible, then press up high on your toes.",
        "Complete a set, then switch feet."
      ],
      commonMistakes: ["Rushing the movement.", "Using the holding arm to pull yourself up."],
      proTips: ["Hold a dumbbell in the hand on the same side as the working leg to add weight."],
      breathingCue: "Exhale as you rise, inhale as you lower."
    },

    // --- CORE ---
    {
      name: "Plank",
      muscleGroups: ["core"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0459.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0459.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0459.gif",
      formSteps: [
        "Rest your weight on your forearms and toes, keeping your body in a straight line.",
        "Engage your abs, glutes, and thighs to hold the position.",
        "Maintain a neutral neck, looking down at the floor."
      ],
      commonMistakes: ["Letting the hips sag down.", "Poking the glutes too high in the air."],
      proTips: ["Squeeze your glutes tightly to help lock your pelvis in place."],
      breathingCue: "Breathe slowly and deeply; do not hold your breath."
    },
    {
      name: "Hanging Leg Raise",
      muscleGroups: ["core", "forearms"],
      difficulty: "Advanced",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0472.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0472.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0472.gif",
      formSteps: [
        "Hang from a pull-up bar with straight arms.",
        "Keeping your legs straight, raise them up until they are parallel to the floor.",
        "Lower your legs back down slowly to prevent swinging."
      ],
      commonMistakes: ["Swinging the body to get the legs up.", "Using hip flexors instead of abs."],
      proTips: ["Tuck your pelvis upward at the top to fully engage the lower rectus abdominis."],
      breathingCue: "Exhale as you raise your legs, inhale as you lower."
    },
    {
      name: "Ab Wheel Rollout",
      muscleGroups: ["core"],
      difficulty: "Advanced",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0857.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0857.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0857.gif",
      formSteps: [
        "Kneel on the floor, holding the handles of an ab wheel in both hands.",
        "Roll the wheel straight forward, extending your body as far as you can without collapsing your back.",
        "Contract your abs to pull the wheel back to the starting kneeling position."
      ],
      commonMistakes: ["Arching or sagging the lower back during extension.", "Pulling back with your arms instead of your abs."],
      proTips: ["Start by rolling out towards a wall to set a limit on how far you can go."],
      breathingCue: "Inhale as you roll out, exhale as you pull back."
    },
    {
      name: "Russian Twist",
      muscleGroups: ["core"],
      difficulty: "Beginner",
      equipment: "Dumbbell",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0687.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0687.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0687.gif",
      formSteps: [
        "Sit on the floor, lean your torso back slightly, and lift your feet off the floor, keeping knees bent.",
        "Hold a dumbbell with both hands near your chest.",
        "Twist your torso to the left, touching the weight to the floor, then twist to the right.",
        "Repeat back and forth."
      ],
      commonMistakes: ["Moving only the arms instead of twisting the shoulders and torso.", "Rounding the spine."],
      proTips: ["Keep your chest high and pull your shoulders back to protect your lower back."],
      breathingCue: "Exhale as you twist, inhale as you pass through center."
    },
    {
      name: "Cable Crunch",
      muscleGroups: ["core"],
      difficulty: "Intermediate",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0153.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0153.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0153.gif",
      formSteps: [
        "Kneel in front of a high pulley machine equipped with a rope attachment.",
        "Grip the rope ends, hold them next to your ears, and hinge slightly at the hips.",
        "Flex your spine, bringing your elbows down towards your knees using your abs.",
        "Return slowly to the upright position, letting the spine extend slightly."
      ],
      commonMistakes: ["Sitting back onto the heels during the crunch.", "Pulling the rope with the arms/shoulders."],
      proTips: ["Keep your hips locked in place; the movement must come from curling your chest inward."],
      breathingCue: "Exhale as you crunch down, inhale as you return."
    },

    // --- CARDIO ---
    {
      name: "Treadmill Run",
      muscleGroups: ["cardio", "calves"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/3666.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/3666.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/3666.gif",
      formSteps: [
        "Step onto the belt and start at a slow walking speed.",
        "Gradually increase speed to a jog or run.",
        "Maintain upright posture with a midfoot strike."
      ],
      commonMistakes: ["Holding onto the side rails while running.", "Stomping down on the heels."],
      proTips: ["Incorporate interval training (HIIT) to boost cardiovascular endurance."],
      breathingCue: "Rhythmic breathing (e.g. inhale for 2 steps, exhale for 2 steps)."
    },
    {
      name: "Jump Rope",
      muscleGroups: ["cardio", "calves", "forearms"],
      difficulty: "Beginner",
      equipment: "Bodyweight",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2612.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2612.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2612.gif",
      formSteps: [
        "Hold the handles at your sides and swing the rope using wrist rotation.",
        "Jump slightly off the balls of your feet as the rope passes underneath.",
        "Land softly and repeat."
      ],
      commonMistakes: ["Jumping too high off the floor.", "Rotating arms from the shoulders instead of the wrists."],
      proTips: ["Keep your elbows close to your ribs for a faster, smoother spin."],
      breathingCue: "Maintain a steady, relaxed breathing pattern."
    },
    {
      name: "Rowing Machine",
      muscleGroups: ["cardio", "back", "biceps", "core", "full body"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0861.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0861.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0861.gif",
      formSteps: [
        "Sit on the seat, strap feet in, and grab the handle with arms straight.",
        "Push off with your legs, then lean back slightly and pull the handle to your abdomen.",
        "Extend your arms, hinge at your hips, and slide forward back to the catch position."
      ],
      commonMistakes: ["Bending the knees before arms are fully extended on the return.", "Rounding the back."],
      proTips: ["The stroke power is 60% legs, 20% core, and 20% arms."],
      breathingCue: "Exhale as you pull back (drive), inhale as you return forward (recovery)."
    },
    {
      name: "Stationary Bike",
      muscleGroups: ["cardio", "quads", "hamstrings"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2138.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2138.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2138.gif",
      formSteps: [
        "Adjust the seat height so your knee has a slight bend at the bottom of the stroke.",
        "Pedal at a steady cadence, keeping your feet flat.",
        "Adjust resistance to challenge endurance or strength."
      ],
      commonMistakes: ["Setting the seat too low, straining knees.", "Slouching over the handlebars."],
      proTips: ["Keep your knees pointing forward; do not let them flare outward."],
      breathingCue: "Breathe steadily in sync with pedal strokes."
    },
    {
      name: "Elliptical Trainer",
      muscleGroups: ["cardio", "full body"],
      difficulty: "Beginner",
      equipment: "Machine",
      gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2141.gif",
      imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2141.jpg",
      videoUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2141.gif",
      formSteps: [
        "Step onto the pedals and grip the moving handlebars.",
        "Pedal in a forward, smooth oval motion, keeping your chest upright.",
        "Push and pull the handlebars with your arms to engage the upper body."
      ],
      commonMistakes: ["Leaning forward too much, putting weight on the arms.", "Lifting heels off the pedals."],
      proTips: ["Change directions and pedal backward to isolate your hamstrings and glutes."],
      breathingCue: "Maintain a steady, rhythmic breathing rate."
    }
  ];

  for (const exercise of exercises) {
    const created = await prisma.exercise.create({
      data: exercise
    });
    console.log(`Created exercise: ${created.name}`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
