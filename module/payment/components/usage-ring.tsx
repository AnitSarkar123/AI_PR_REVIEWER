"use client";

interface UsageRingProps {
	value: number;
	max: number | null;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

export function UsageRing({
	value,
	max,
	size = 80,
	strokeWidth = 6,
	className = "",
}: UsageRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const isUnlimited = max === null;
	const percentage = isUnlimited ? 0 : Math.min((value / max) * 100, 100);
	const offset = circumference - (percentage / 100) * circumference;

	const isWarning = !isUnlimited && percentage >= 80;
	const isDanger = !isUnlimited && percentage >= 95;

	const strokeColor = isDanger
		? "stroke-destructive"
		: isWarning
		? "stroke-amber-500"
		: "stroke-primary";

	return (
		<div className={`relative inline-flex items-center justify-center ${className}`}>
			<svg
				width={size}
				height={size}
				className="-rotate-90"
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max ?? Infinity}
				aria-label={`Usage: ${value} of ${max ?? "unlimited"}`}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted"
					opacity={0.2}
				/>
				{!isUnlimited && (
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						className={`${strokeColor} transition-all duration-500 ease-out`}
					/>
				)}
			</svg>
			<span className="absolute text-xs font-semibold">
				{isUnlimited ? "∞" : `${Math.round(percentage)}%`}
			</span>
		</div>
	);
}
