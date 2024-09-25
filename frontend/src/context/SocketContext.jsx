import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			const socket = io("https://chatapp-mern-yhsk.onrender.com/", {
				query: {
					userId: authUser._id,
				},
			});

			setSocket(socket);

			// Listening for connection errors
			socket.on('connect_error', (error) => {
				console.error("Connection Error:", error);
			  });
			  
			  socket.on('disconnect', (reason) => {
				console.log("Disconnected:", reason);
				if (reason === 'io server disconnect') {
				  // The server has forcefully disconnected the client
				  socket.connect(); // Optionally reconnect
				}
			  });

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
