import { useEffect, useRef, useState } from "react";

const LazyLoadVideo = () => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 } // 50% of the video must be in view to load
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  // Function to pause the video at the last frame
  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = videoRef.current.duration; // Set to the last frame
    }
  };

  return (
    <video
      ref={videoRef}
      className="absolute top-0 left-0 w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      onEnded={handleVideoEnd} // Trigger when the video ends
    >
      {isInView && <source src="/paintwater.mp4" type="video/mp4" />}
    </video>
  );
};

export default LazyLoadVideo;
