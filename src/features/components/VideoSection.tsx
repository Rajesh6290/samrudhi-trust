"use client";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Video {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
}

interface VideoCardProps {
  video: Video;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all"
    >
      {/* Video Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          src={video.image}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
        />

        {/* Video Overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent transition-opacity ${
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-orange-500 hover:bg-orange-400 text-white p-6 rounded-full transition-all hover:scale-110 shadow-2xl"
            >
              {isPlaying ? (
                <Pause size={32} />
              ) : (
                <Play size={32} className="ml-1" />
              )}
            </button>
          </div>

          {/* Category Badge */}
          {!isPlaying && (
            <div className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {video.category}
            </div>
          )}
        </div>

        {/* Controls */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="text-white hover:text-orange-500 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:text-orange-500 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-orange-500 transition-colors">
          {video.title}
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {video.description || ""}
        </p>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-4 border-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

const VideoSection: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/gallery?active=true");
        const data = await res.json();

        // Filter for video files
        const videoItems = (data.items || []).filter(
          (item: Video) =>
            item.image &&
            (item.image.includes(".mp4") ||
              item.image.includes(".mov") ||
              item.image.includes(".webm") ||
              item.image.includes("video"))
        );

        setVideos(videoItems);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <section className="py-32 bg-linear-to-b from-white to-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-4 block">
            See Our Impact
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
            Stories in Motion
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Experience firsthand the transformation we bring to communities
            through our dedicated initiatives.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">
              No videos available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <VideoCard key={video._id} video={video} index={index} />
            ))}
          </div>
        )}

        {/* CTA */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-center mt-16"
          >
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 shadow-xl">
              View All Videos
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
