"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Logout = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	const router = useRouter();

	return (
		<button
			type="button"
			className={className}
			onClick={() =>
				signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/login");
						},
					},
				})
			}
		>
			{children}
		</button>
	);
};

export default Logout;
