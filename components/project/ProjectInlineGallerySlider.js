"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const AUTO_PLAY_MS = 10000;
const USER_INTERACTION_COOLDOWN_MS = 12000;
const SWIPE_TRIGGER_RATIO = 0.55;
const MIN_SWIPE_TRIGGER_PX = 140;
const FLICK_MIN_DISTANCE_PX = 22;
const FLICK_MIN_VELOCITY_PX_PER_MS = 0.38;

export default function ProjectInlineGallerySlider({ images = [], projectTitle = "" }) {
	const preparedImages = useMemo(() => (
		Array.isArray(images) ? images.filter((image) => typeof image?.url === "string" && image.url.length > 0) : []
	), [images]);
	const visibleThumbsCount = 5;
	const [activeIndex, setActiveIndex] = useState(0);
	const [lastInteractionAt, setLastInteractionAt] = useState(0);
	const [slideDirection, setSlideDirection] = useState("right");
	const stageRef = useRef(null);
	const dragStartXRef = useRef(null);
	const dragStartTimeRef = useRef(0);
	const isDraggingRef = useRef(false);
	const [dragOffsetX, setDragOffsetX] = useState(0);

	useEffect(() => {
		setActiveIndex(0);
	}, [preparedImages.length]);

	useEffect(() => {
		if(preparedImages.length < 2) {
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			const now = Date.now();
			if(lastInteractionAt > 0 && now - lastInteractionAt < USER_INTERACTION_COOLDOWN_MS) {
				return;
			}

			setSlideDirection("right");
			setActiveIndex((current) => (current + 1) % preparedImages.length);
		}, AUTO_PLAY_MS);

		return () => window.clearInterval(intervalId);
	}, [lastInteractionAt, preparedImages.length]);

	if(preparedImages.length === 0) {
		return null;
	}
	const hasMultipleImages = preparedImages.length > 1;

	const markInteracted = () => {
		setLastInteractionAt(Date.now());
	};

	const openAt = (index) => {
		if(index < 0 || index >= preparedImages.length) {
			return;
		}

		if(index !== activeIndex) {
			setSlideDirection(index > activeIndex ? "right" : "left");
		}

		markInteracted();
		setActiveIndex(index);
	};

	const goPrev = () => {
		setSlideDirection("left");
		openAt((activeIndex - 1 + preparedImages.length) % preparedImages.length);
	};

	const goNext = () => {
		setSlideDirection("right");
		openAt((activeIndex + 1) % preparedImages.length);
	};

	const resetDragState = () => {
		dragStartXRef.current = null;
		dragStartTimeRef.current = 0;
		isDraggingRef.current = false;
		setDragOffsetX(0);
	};

	const getSwipeTriggerPx = () => {
		const stageWidth = Number(stageRef.current?.clientWidth) || 0;
		if(stageWidth <= 0) {
			return MIN_SWIPE_TRIGGER_PX;
		}

		return Math.max(MIN_SWIPE_TRIGGER_PX, Math.floor(stageWidth * SWIPE_TRIGGER_RATIO));
	};

	const handleSwipeDelta = (deltaX) => {
		const triggerPx = getSwipeTriggerPx();
		if(Math.abs(deltaX) < triggerPx) {
			return;
		}

		if(deltaX < 0) {
			goNext();
			return;
		}

		goPrev();
	};

	const onPointerDown = (event) => {
		if(!hasMultipleImages) {
			return;
		}

		isDraggingRef.current = true;
		dragStartXRef.current = event.clientX;
		dragStartTimeRef.current = performance.now();
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const onPointerMove = (event) => {
		if(!isDraggingRef.current || dragStartXRef.current === null) {
			return;
		}

		const deltaX = event.clientX - dragStartXRef.current;
		const triggerPx = getSwipeTriggerPx();
		setDragOffsetX(deltaX);

		if(deltaX <= -triggerPx) {
			goNext();
			dragStartXRef.current = event.clientX;
			setDragOffsetX(0);
			return;
		}

		if(deltaX >= triggerPx) {
			goPrev();
			dragStartXRef.current = event.clientX;
			setDragOffsetX(0);
		}
	};

	const onPointerUp = (event) => {
		if(dragStartXRef.current === null) {
			resetDragState();
			return;
		}

		const deltaX = event.clientX - dragStartXRef.current;
		const elapsedMs = Math.max(1, performance.now() - dragStartTimeRef.current);
		const velocityPxPerMs = Math.abs(deltaX) / elapsedMs;
		const isFlick = Math.abs(deltaX) >= FLICK_MIN_DISTANCE_PX && velocityPxPerMs >= FLICK_MIN_VELOCITY_PX_PER_MS;
		const isShortDirectionalSwipe = Math.abs(deltaX) >= FLICK_MIN_DISTANCE_PX;

		if(isFlick || isShortDirectionalSwipe) {
			if(deltaX < 0) {
				goNext();
			} else {
				goPrev();
			}
		} else {
			handleSwipeDelta(deltaX);
		}

		resetDragState();
		event.currentTarget.releasePointerCapture?.(event.pointerId);
	};

	const onPointerCancel = () => resetDragState();
	const onTouchStart = (event) => {
		if(!hasMultipleImages) {
			return;
		}

		const touch = event.touches?.[0];
		if(!touch) {
			return;
		}

		isDraggingRef.current = true;
		dragStartXRef.current = touch.clientX;
		dragStartTimeRef.current = performance.now();
	};

	const onTouchMove = (event) => {
		const touch = event.touches?.[0];
		if(!touch || !isDraggingRef.current || dragStartXRef.current === null) {
			return;
		}

		const deltaX = touch.clientX - dragStartXRef.current;
		const triggerPx = getSwipeTriggerPx();
		setDragOffsetX(deltaX);

		if(deltaX <= -triggerPx) {
			goNext();
			dragStartXRef.current = touch.clientX;
			setDragOffsetX(0);
			return;
		}

		if(deltaX >= triggerPx) {
			goPrev();
			dragStartXRef.current = touch.clientX;
			setDragOffsetX(0);
		}
	};

	const onTouchEnd = (event) => {
		if(dragStartXRef.current === null) {
			resetDragState();
			return;
		}

		const touch = event.changedTouches?.[0];
		if(!touch) {
			resetDragState();
			return;
		}

		const deltaX = touch.clientX - dragStartXRef.current;
		const elapsedMs = Math.max(1, performance.now() - dragStartTimeRef.current);
		const velocityPxPerMs = Math.abs(deltaX) / elapsedMs;
		const isFlick = Math.abs(deltaX) >= FLICK_MIN_DISTANCE_PX && velocityPxPerMs >= FLICK_MIN_VELOCITY_PX_PER_MS;
		const isShortDirectionalSwipe = Math.abs(deltaX) >= FLICK_MIN_DISTANCE_PX;

		if(isFlick || isShortDirectionalSwipe) {
			if(deltaX < 0) {
				goNext();
			} else {
				goPrev();
			}
		} else {
			handleSwipeDelta(deltaX);
		}

		resetDragState();
	};

	useEffect(() => {
		const handleWindowMouseUp = () => resetDragState();
		const handleWindowBlur = () => resetDragState();

		window.addEventListener("mouseup", handleWindowMouseUp);
		window.addEventListener("blur", handleWindowBlur);

		return () => {
			window.removeEventListener("mouseup", handleWindowMouseUp);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, []);
	const activeImage = preparedImages[activeIndex];
	const lastWindowStart = Math.max(0, preparedImages.length - visibleThumbsCount);
	const thumbsWindowStart = preparedImages.length <= visibleThumbsCount ? 0 : Math.min(activeIndex, lastWindowStart);
	const visibleThumbs = preparedImages.slice(thumbsWindowStart, thumbsWindowStart + visibleThumbsCount);

	return (
		<div className="content content--padding project-inline-gallery">
			<div className={`project-inline-gallery__stage ${!hasMultipleImages ? "is-static" : ""}`} ref={stageRef} onPointerDown={hasMultipleImages ? onPointerDown : undefined} onPointerMove={hasMultipleImages ? onPointerMove : undefined} onPointerUp={hasMultipleImages ? onPointerUp : undefined} onPointerCancel={hasMultipleImages ? onPointerCancel : undefined} onLostPointerCapture={hasMultipleImages ? onPointerCancel : undefined} onTouchStart={hasMultipleImages ? onTouchStart : undefined} onTouchMove={hasMultipleImages ? onTouchMove : undefined} onTouchEnd={hasMultipleImages ? onTouchEnd : undefined} onTouchCancel={hasMultipleImages ? onPointerCancel : undefined} onDragStart={(event) => event.preventDefault()}>
				<img
					key={activeImage.id || activeImage.url}
					src={activeImage.url}
					alt={activeImage.title || `${projectTitle} image ${activeIndex + 1}`}
					className={`project-inline-gallery__main-image project-inline-gallery__main-image--${slideDirection}`}
					loading="eager"
					draggable={false}
					style={dragOffsetX !== 0 ? { transform: `translateX(${dragOffsetX}px)`, transition: "none" } : undefined}
				/>
			</div>

			<div className="project-inline-gallery__thumbs-row">
				<button type="button" className="project-inline-gallery__arrow project-inline-gallery__arrow--prev" aria-label="Previous image" onClick={goPrev} disabled={!hasMultipleImages}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="m15 18-6-6 6-6"></path>
					</svg>
				</button>

				<div className="project-inline-gallery__thumbs" style={{ "--thumb-count": Math.max(1, visibleThumbs.length) }}>
					{visibleThumbs.map((image, offset) => {
						const index = thumbsWindowStart + offset;
						return (
							<button key={image.id || image.url} type="button" className={`project-inline-gallery__thumb ${index === activeIndex ? "is-active" : ""}`} onClick={() => openAt(index)} aria-label={`Open image ${index + 1}`}>
								<img src={image.url} alt={image.title || `${projectTitle} thumbnail ${index + 1}`} loading="lazy" />
							</button>
						);
					})}
				</div>

				<button type="button" className="project-inline-gallery__arrow project-inline-gallery__arrow--next" aria-label="Next image" onClick={goNext} disabled={!hasMultipleImages}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="m9 18 6-6-6-6"></path>
					</svg>
				</button>
			</div>
		</div>
	);
}