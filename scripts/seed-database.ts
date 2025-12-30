import bcrypt from "bcryptjs";
import connectDB from "../src/lib/mongodb";
import Certificate from "../src/models/Certificate";
import Content from "../src/models/Content";
import FAQ from "../src/models/FAQ";
import Gallery from "../src/models/Gallery";
import Service from "../src/models/Service";
import SiteSettings from "../src/models/SiteSettings";
import Stat from "../src/models/Stat";
import Testimonial from "../src/models/Testimonial";
import User from "../src/models/User";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Service.deleteMany({});
    await Stat.deleteMany({});
    await Certificate.deleteMany({});
    await Content.deleteMany({});
    await Gallery.deleteMany({});
    await FAQ.deleteMany({});
    await Testimonial.deleteMany({});
    await SiteSettings.deleteMany({});

    // 1. Create Admin User
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      name: "Admin",
      email: "admin@samriddhisevatrust.org",
      password: "Admin@123",
      role: "admin",
    });
    console.log("✅ Admin created - Email: admin@samriddhisevatrust.org | Password: Admin@123");

    // 2. Site Settings
    console.log("⚙️  Setting up site settings...");
    await SiteSettings.create({
      organizationName: "Samriddhi Seva Trust",
      tagline: "Giving Happiness is the Best Way to Find Yourself",
      email: "samriddhisevatrust2022@gmail.com",
      phone: "+91 97763 91244",
      address: "110/1687, Sankarpur Mouza, K-4, Kalinga Vihar, Bhubaneswar (BBSR), Odisha – 751019, India",
      bankName: "UCO Bank",
      accountNumber: "04700110066034",
      ifscCode: "UCBA0000470",
      accountHolderName: "Samriddhi Seva Trust",
      upiId: "9778391244@ucobank",
      facebook: "https://facebook.com/samriddhisevatrust",
      instagram: "https://instagram.com/samriddhisevatrust",
      twitter: "https://twitter.com/samriddhisevatrust",
      youtube: "https://youtube.com/@samriddhisevatrust",
    });
    console.log("✅ Site settings configured");

    // 3. Services (What We Do)
    console.log("🛠️  Adding services...");
    await Service.insertMany([
      {
        icon: "heart",
        title: "Food Distribution",
        description: "Providing nutritious meals to underprivileged communities and hunger relief programs.",
        order: 1,
        isActive: true,
      },
      {
        icon: "users",
        title: "Community Support",
        description: "Building stronger communities through social welfare programs and support initiatives.",
        order: 2,
        isActive: true,
      },
      {
        icon: "droplet",
        title: "Blood Donation Drives",
        description: "Organizing regular blood donation camps to save lives and create awareness.",
        order: 3,
        isActive: true,
      },
      {
        icon: "gift",
        title: "Child Welfare",
        description: "Supporting education, health, and overall development of underprivileged children.",
        order: 4,
        isActive: true,
      },
      {
        icon: "hand",
        title: "Emergency Relief",
        description: "Rapid response to natural disasters and emergencies with essential supplies.",
        order: 5,
        isActive: true,
      },
      {
        icon: "book",
        title: "Education Support",
        description: "Providing books, stationery, and educational resources to needy students.",
        order: 6,
        isActive: true,
      },
    ]);
    console.log("✅ Services added");

    // 4. Statistics (Real-Time Impact)
    console.log("📊 Adding statistics...");
    await Stat.insertMany([
      {
        title: "Meals Served",
        value: 50000,
        suffix: "+",
        order: 1,
        isActive: true,
      },
      {
        title: "Lives Touched",
        value: 25000,
        suffix: "+",
        order: 2,
        isActive: true,
      },
      {
        title: "Blood Units Collected",
        value: 1500,
        suffix: "+",
        order: 3,
        isActive: true,
      },
      {
        title: "Volunteers",
        value: 200,
        suffix: "+",
        order: 4,
        isActive: true,
      },
      {
        title: "Events Organized",
        value: 150,
        suffix: "+",
        order: 5,
        isActive: true,
      },
    ]);
    console.log("✅ Statistics added");

    // 5. Certificates
    console.log("🏆 Adding certificates...");
    await Certificate.insertMany([
      {
        name: "NGO Registration Certificate",
        issuedBy: "Government of Odisha",
        issuedDate: new Date("2022-01-15"),
        certificateNumber: "41532200031/2022",
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        order: 1,
        isActive: true,
      },
      {
        name: "12A Registration Certificate",
        issuedBy: "Income Tax Department",
        issuedDate: new Date("2022-03-20"),
        certificateNumber: "12A-2022-ODI-001",
        imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        order: 2,
        isActive: true,
      },
      {
        name: "80G Tax Exemption Certificate",
        issuedBy: "Income Tax Department",
        issuedDate: new Date("2022-04-10"),
        certificateNumber: "80G-2022-ODI-001",
        imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        order: 3,
        isActive: true,
      },
      {
        name: "CSR Registration",
        issuedBy: "Ministry of Corporate Affairs",
        issuedDate: new Date("2022-06-05"),
        certificateNumber: "CSR-2022-ODI-001",
        imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
        order: 4,
        isActive: true,
      },
      {
        name: "Excellence in Social Service Award",
        issuedBy: "Odisha Social Welfare Board",
        issuedDate: new Date("2023-08-15"),
        certificateNumber: "AWARD-2023-SST",
        imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800",
        order: 5,
        isActive: true,
      },
    ]);
    console.log("✅ Certificates added");

    // 6. Content (About Us & Our Story)
    console.log("📝 Adding content...");
    await Content.insertMany([
      {
        key: "about",
        title: "About Samriddhi Seva Trust",
        content: `Samriddhi Seva Trust is a registered non-profit organization dedicated to serving humanity through various social welfare initiatives. Established in 2022, we believe that "Giving Happiness is the Best Way to Find Yourself."

Our mission is to create a positive impact in society by addressing critical issues like hunger, health, education, and community welfare. We work tirelessly to bring smiles to the faces of those who need it most.

With a strong team of dedicated volunteers and supporters, we have successfully conducted numerous food distribution drives, blood donation camps, child welfare programs, and emergency relief operations across Odisha.

Every contribution, whether big or small, helps us extend our reach and touch more lives. Join us in our journey to make the world a better place.`,
        images: [
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
        ],
        metadata: {
          registrationNumber: "41532200031/2022",
          founded: "2022",
          location: "Bhubaneswar, Odisha",
        },
      },
      {
        key: "story",
        title: "Our Journey",
        content: `The story of Samriddhi Seva Trust began with a simple yet powerful vision – to make a difference in the lives of those who are less fortunate. What started as a small group of passionate individuals distributing food to the homeless has now grown into a full-fledged organization touching thousands of lives.

In 2022, a group of like-minded individuals came together with a shared dream of creating a platform where compassion meets action. We officially registered as Samriddhi Seva Trust and embarked on our mission to serve humanity.

Our first food distribution drive was a humbling experience. The gratitude in the eyes of those we served became our driving force. Since then, we have expanded our services to include blood donation camps, child welfare programs, education support, and emergency relief operations.

Today, we are proud to have a dedicated team of 200+ volunteers, and we have served over 50,000 meals, collected 1500+ blood units, and organized 150+ social welfare events.

But this is just the beginning. With your support, we aim to expand our reach and create an even bigger impact in the communities we serve. Together, we can build a society where no one goes hungry, where healthcare is accessible, and where every child has the opportunity to learn and grow.`,
        images: [
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
          "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
          "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800",
        ],
        metadata: {
          milestones: ["50000+ Meals Served", "1500+ Blood Units", "150+ Events"],
        },
      },
    ]);
    console.log("✅ Content added");

    // 7. Gallery Images
    console.log("🖼️  Adding gallery images...");
    await Gallery.insertMany([
      {
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
        category: "food-rescue",
        title: "Community Food Distribution Drive",
        description: "Serving nutritious meals to underprivileged families",
      },
      {
        image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1200",
        category: "food-rescue",
        title: "Street Food Distribution",
        description: "Providing hot meals to homeless individuals",
      },
      {
        image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200",
        category: "blood-donation",
        title: "Blood Donation Camp 2023",
        description: "Successful blood donation drive with 100+ donors",
      },
      {
        image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200",
        category: "blood-donation",
        title: "Life Saving Initiative",
        description: "Regular blood donation camps to save lives",
      },
      {
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200",
        category: "child-welfare",
        title: "Education Support Program",
        description: "Distributing books and stationery to needy children",
      },
      {
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
        category: "child-welfare",
        title: "Children's Day Celebration",
        description: "Bringing smiles to underprivileged children",
      },
      {
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200",
        category: "events",
        title: "Community Outreach Program",
        description: "Engaging with local communities",
      },
      {
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
        category: "events",
        title: "Volunteer Training Workshop",
        description: "Empowering our volunteer team",
      },
    ]);
    console.log("✅ Gallery images added");

    // 8. FAQs
    console.log("❓ Adding FAQs...");
    await FAQ.insertMany([
      {
        question: "What is Samriddhi Seva Trust?",
        answer: "Samriddhi Seva Trust is a registered non-profit organization (Registration No: 41532200031/2022) dedicated to social welfare activities including food distribution, blood donation, child welfare, and emergency relief operations.",
        category: "general",
        order: 1,
      },
      {
        question: "How can I donate to Samriddhi Seva Trust?",
        answer: "You can donate via bank transfer to UCO Bank (Account No: 04700110066034, IFSC: UCBA0000470) or through UPI (9778391244@ucobank). All donations are used for social welfare activities.",
        category: "donation",
        order: 2,
      },
      {
        question: "Are donations tax-deductible?",
        answer: "Yes, we have 80G certification which makes your donations tax-deductible under Indian Income Tax Act. You will receive a donation receipt for tax purposes.",
        category: "donation",
        order: 3,
      },
      {
        question: "How can I volunteer with your organization?",
        answer: "We welcome volunteers! You can register through our website or contact us at +91 97763 91244 or email samriddhisevatrust2022@gmail.com. We conduct regular volunteer orientation programs.",
        category: "volunteering",
        order: 4,
      },
      {
        question: "What programs do you run?",
        answer: "We run multiple programs including food distribution drives, blood donation camps, child welfare initiatives, education support, emergency relief operations, and community development programs.",
        category: "programs",
        order: 5,
      },
      {
        question: "Where are you located?",
        answer: "We are based in Bhubaneswar, Odisha. Our registered address is 110/1687, Sankarpur Mouza, K-4, Kalinga Vihar, Bhubaneswar, Odisha – 751019.",
        category: "general",
        order: 6,
      },
      {
        question: "How do you ensure transparency in fund utilization?",
        answer: "We maintain complete transparency through regular financial audits, detailed reports, and updates on our website and social media. All major activities are documented and shared with our donors and supporters.",
        category: "other",
        order: 7,
      },
      {
        question: "Can corporates partner with you for CSR activities?",
        answer: "Yes, we are CSR registered and welcome corporate partnerships. We can design customized programs aligned with your CSR objectives. Contact us for partnership opportunities.",
        category: "other",
        order: 8,
      },
    ]);
    console.log("✅ FAQs added");

    // 9. Testimonials (Real Data)
    console.log("💬 Adding testimonials...");
    await Testimonial.insertMany([
      {
        name: "Rajesh Kumar",
        role: "Volunteer Coordinator",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        content: "Being part of Samriddhi Seva Trust has been a life-changing experience. The dedication and passion of the team towards serving humanity is truly inspiring. Every food distribution drive brings immense satisfaction.",
        rating: 5,
        order: 1,
      },
      {
        name: "Priya Patel",
        role: "Regular Donor",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        content: "I have been supporting Samriddhi Seva Trust for over a year now. Their transparency and commitment to social welfare is commendable. I can see exactly where my donations are making a difference.",
        rating: 5,
        order: 2,
      },
      {
        name: "Amit Sharma",
        role: "Blood Donor",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        content: "The blood donation camps organized by Samriddhi Seva Trust are well-managed and professional. They make the entire process comfortable and ensure proper care. Proud to be a regular donor.",
        rating: 5,
        order: 3,
      },
      {
        name: "Sneha Reddy",
        role: "Parent of Beneficiary",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        content: "My children received educational support from this trust. The books and stationery they provided helped my kids continue their education. Forever grateful for their support during tough times.",
        rating: 5,
        order: 4,
      },
      {
        name: "Dr. Suresh Mohanty",
        role: "Medical Professional",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        content: "As a medical professional, I appreciate Samriddhi Seva Trust's efforts in organizing blood donation camps. Their systematic approach and proper documentation makes a significant impact in saving lives.",
        rating: 5,
        order: 5,
      },
      {
        name: "Kavita Singh",
        role: "Corporate CSR Manager",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
        content: "Our company partnered with Samriddhi Seva Trust for CSR activities. Their professionalism and ground-level impact exceeded our expectations. Highly recommend for corporate partnerships.",
        rating: 5,
        order: 6,
      },
    ]);
    console.log("✅ Testimonials added");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email: admin@samriddhisevatrust.org");
    console.log("Password: Admin@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
