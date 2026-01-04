import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Gallery from "@/models/Gallery";
import Service from "@/models/Service";
import Testimonial from "@/models/Testimonial";
import Feedback from "@/models/Feedback";
import Contact from "@/models/Contact";
import Campaign from "@/models/Campaign";
import Volunteer from "@/models/Volunteer";
import Blog from "@/models/Blog";
import Certificate from "@/models/Certificate";
import Content from "@/models/Content";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const { user, error } = await requireAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get filter parameters from query string
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") || "30"; // 7, 30, 90, or custom
    const campaignStatus = searchParams.get("campaignStatus"); // ongoing, completed, upcoming
    const blogStatus = searchParams.get("blogStatus"); // published, draft, archived
    const customStartDate = searchParams.get("startDate");
    const customEndDate = searchParams.get("endDate");

    // Calculate date ranges for analytics based on filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filterStartDate: Date;
    let filterEndDate = new Date(today);
    filterEndDate.setDate(filterEndDate.getDate() + 1); // Include today

    if (customStartDate && customEndDate) {
      filterStartDate = new Date(customStartDate);
      filterEndDate = new Date(customEndDate);
    } else {
      const days = parseInt(dateRange) || 30;
      filterStartDate = new Date(today);
      filterStartDate.setDate(filterStartDate.getDate() - days);
    }

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Build dynamic match conditions for filters
    const campaignMatchCondition: Record<string, string> = {};
    if (campaignStatus) {
      campaignMatchCondition.status = campaignStatus;
    }

    const blogMatchCondition: Record<string, string> = {};
    if (blogStatus) {
      blogMatchCondition.status = blogStatus;
    }

    // Advanced aggregation pipeline for comprehensive analytics
    const [
      memberAnalytics,
      galleryAnalytics,
      campaignAnalytics,
      volunteerAnalytics,
      blogAnalytics,
      feedbackAnalytics,
      contactAnalytics,
      totalCounts,
    ] = await Promise.all([
      // Members Analytics with growth trends
      Member.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
            last60Days: [
              { $match: { createdAt: { $gte: sixtyDaysAgo } } },
              { $count: "count" },
            ],
            last7Days: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $count: "count" },
            ],
            dailyGrowth: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),

      // Gallery Analytics
      Gallery.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
            last7Days: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $count: "count" },
            ],
            byCategory: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // Campaign Analytics with status breakdown
      Campaign.aggregate([
        {
          $facet: {
            total: [
              ...(Object.keys(campaignMatchCondition).length > 0
                ? [{ $match: campaignMatchCondition }]
                : []),
              { $count: "count" },
            ],
            ongoing: [
              { $match: { status: "ongoing", ...campaignMatchCondition } },
              { $count: "count" },
            ],
            completed: [
              { $match: { status: "completed", ...campaignMatchCondition } },
              { $count: "count" },
            ],
            upcoming: [
              { $match: { status: "upcoming", ...campaignMatchCondition } },
              { $count: "count" },
            ],
            last30Days: [
              {
                $match: {
                  createdAt: { $gte: thirtyDaysAgo },
                  ...campaignMatchCondition,
                },
              },
              { $count: "count" },
            ],
            filtered: [
              {
                $match: {
                  createdAt: { $gte: filterStartDate, $lte: filterEndDate },
                  ...campaignMatchCondition,
                },
              },
              { $count: "count" },
            ],
            byType: [
              ...(Object.keys(campaignMatchCondition).length > 0
                ? [{ $match: campaignMatchCondition }]
                : []),
              { $group: { _id: "$type", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // Volunteer Analytics
      Volunteer.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
            last7Days: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $count: "count" },
            ],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // Blog Analytics with publish status
      Blog.aggregate([
        {
          $facet: {
            total: [
              ...(Object.keys(blogMatchCondition).length > 0
                ? [{ $match: blogMatchCondition }]
                : []),
              { $count: "count" },
            ],
            published: [
              { $match: { status: "published", ...blogMatchCondition } },
              { $count: "count" },
            ],
            draft: [
              { $match: { status: "draft", ...blogMatchCondition } },
              { $count: "count" },
            ],
            archived: [
              { $match: { status: "archived", ...blogMatchCondition } },
              { $count: "count" },
            ],
            last30Days: [
              {
                $match: {
                  createdAt: { $gte: thirtyDaysAgo },
                  ...blogMatchCondition,
                },
              },
              { $count: "count" },
            ],
            last7Days: [
              {
                $match: {
                  createdAt: { $gte: sevenDaysAgo },
                  ...blogMatchCondition,
                },
              },
              { $count: "count" },
            ],
            filtered: [
              {
                $match: {
                  createdAt: { $gte: filterStartDate, $lte: filterEndDate },
                  ...blogMatchCondition,
                },
              },
              { $count: "count" },
            ],
            totalViews: [
              ...(Object.keys(blogMatchCondition).length > 0
                ? [{ $match: blogMatchCondition }]
                : []),
              { $group: { _id: null, total: { $sum: "$views" } } },
            ],
            totalLikes: [
              ...(Object.keys(blogMatchCondition).length > 0
                ? [{ $match: blogMatchCondition }]
                : []),
              { $group: { _id: null, total: { $sum: "$likes" } } },
            ],
          },
        },
      ]),

      // Feedback Analytics with ratings
      Feedback.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            averageRating: [
              { $group: { _id: null, avg: { $avg: "$rating" } } },
            ],
            ratingDistribution: [
              { $group: { _id: "$rating", count: { $sum: 1 } } },
              { $sort: { _id: -1 } },
            ],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Contact Analytics with response status
      Contact.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            unread: [{ $match: { isRead: false } }, { $count: "count" }],
            read: [{ $match: { isRead: true } }, { $count: "count" }],
            last7Days: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $count: "count" },
            ],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Simple counts for other collections
      Promise.all([
        Service.countDocuments(),
        Testimonial.countDocuments(),
        Certificate.countDocuments(),
        Content.countDocuments(),
      ]),
    ]);

    // Process aggregation results
    const memberStats = memberAnalytics[0];
    const galleryStats = galleryAnalytics[0];
    const campaignStats = campaignAnalytics[0];
    const volunteerStats = volunteerAnalytics[0];
    const blogStats = blogAnalytics[0];
    const feedbackStats = feedbackAnalytics[0];
    const contactStats = contactAnalytics[0];

    // Calculate growth percentages and trends
    const memberLast30 = memberStats.last30Days[0]?.count || 0;
    const memberLast60 = memberStats.last60Days[0]?.count || 0;
    const memberPrevious30 = memberLast60 - memberLast30;
    const memberGrowthRate =
      memberPrevious30 > 0
        ? ((memberLast30 - memberPrevious30) / memberPrevious30) * 100
        : 0;

    const stats = {
      // Overview totals
      totalMembers: memberStats.total[0]?.count || 0,
      totalGallery: galleryStats.total[0]?.count || 0,
      totalServices: totalCounts[0] || 0,
      totalTestimonials: totalCounts[1] || 0,
      totalFeedback: feedbackStats.total[0]?.count || 0,
      totalContact: contactStats.total[0]?.count || 0,
      totalCampaigns: campaignStats.total[0]?.count || 0,
      totalVolunteers: volunteerStats.total[0]?.count || 0,
      totalBlogs: blogStats.total[0]?.count || 0,
      totalCertificates: totalCounts[2] || 0,
      totalContent: totalCounts[3] || 0,

      // Recent activity (last 30 days)
      recentMembers: memberLast30,
      recentGallery: galleryStats.last30Days[0]?.count || 0,
      recentCampaigns: campaignStats.last30Days[0]?.count || 0,
      recentVolunteers: volunteerStats.last30Days[0]?.count || 0,
      recentBlogs: blogStats.last30Days[0]?.count || 0,
      recentFeedback: feedbackStats.last30Days[0]?.count || 0,
      recentContacts: contactStats.last30Days[0]?.count || 0,

      // Weekly activity (last 7 days)
      weeklyMembers: memberStats.last7Days[0]?.count || 0,
      weeklyGallery: galleryStats.last7Days[0]?.count || 0,
      weeklyVolunteers: volunteerStats.last7Days[0]?.count || 0,
      weeklyBlogs: blogStats.last7Days[0]?.count || 0,
      weeklyContacts: contactStats.last7Days[0]?.count || 0,

      // Growth trends
      memberGrowthRate: Math.round(memberGrowthRate * 10) / 10,
      memberDailyGrowth: memberStats.dailyGrowth || [],

      // Campaign analytics
      ongoingCampaigns: campaignStats.ongoing[0]?.count || 0,
      completedCampaigns: campaignStats.completed[0]?.count || 0,
      upcomingCampaigns: campaignStats.upcoming[0]?.count || 0,
      campaignsByType: campaignStats.byType || [],
      filteredCampaigns: campaignStats.filtered?.[0]?.count || 0,

      // Volunteer status breakdown
      volunteerByStatus: volunteerStats.byStatus || [],

      // Blog publishing stats
      publishedBlogs: blogStats.published[0]?.count || 0,
      draftBlogs: blogStats.draft[0]?.count || 0,
      archivedBlogs: blogStats.archived[0]?.count || 0,
      totalBlogViews: blogStats.totalViews[0]?.total || 0,
      totalBlogLikes: blogStats.totalLikes[0]?.total || 0,
      filteredBlogs: blogStats.filtered?.[0]?.count || 0,

      // Feedback insights
      averageRating: feedbackStats.averageRating[0]?.avg || 0,
      ratingDistribution: feedbackStats.ratingDistribution || [],

      // Contact status (using isRead field)
      unreadContacts: contactStats.unread[0]?.count || 0,
      readContacts: contactStats.read[0]?.count || 0,

      // Gallery categories
      galleryByCategory: galleryStats.byCategory || [],
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
