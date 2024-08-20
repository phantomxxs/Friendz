import User from '../models/User.js';

export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

export const getRandomUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Fetch all users except the current user and their friends
    const otherUsers = await User.find({
      _id: { $nin: [...user.friends, userId] }, // $nin means "not in"
    });

    // Shuffle and select a subset of users (e.g., 5 random users)
    const randomUsers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, 5);

    // Format the random users
    const formattedRandomUsers = randomUsers.map(
      ({ _id, firstName, lastName, picturePath, occupation }) => {
        return {
          _id,
          firstName,
          lastName,
          picturePath,
          occupation,
        };
      }
    );

    return res.status(200).json(formattedRandomUsers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath, occupation }) => {
        return {
          _id,
          firstName,
          lastName,
          picturePath,
          occupation,
        };
      }
    );

    return res.status(200).json(formattedFriends);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const handleFriendRequest = async (req, res) => {
  try {
    const { action, friendId } = req.body;

    if (!action) {
      res.status(400).json({ message: 'Invalid action' });
    }
    if (!friendId) {
      res.status(400).json({ message: 'Invalid friend id' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    switch (action) {
      case 'send':
        await sendFriendRequest(req, res, user, friend);
        break;
      case 'accept':
        await acceptFriendRequest(req, res, user, friend);
        break;
      case 'decline':
        await declineFriendRequest(req, res, user, friend);
        break;
      case 'withdraw':
        await withdrawFriendRequest(req, res, user, friend);
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function sendFriendRequest(req, res, user, friend) {
  if (friend.friendRequests.includes(user._id)) {
    return res.status(400).json({ message: 'Friend request already sent' });
  } else {
    friend.friendRequests.push(user._id);
    await friend.save();
    return res.status(200).json({ message: 'Friend request sent succesfully' });
  }
}

async function acceptFriendRequest(req, res, user, friend) {
  if (!friend.friendRequests.includes(user._id)) {
    return res.status(400).json({
      message:
        'Unable to accept friend request, request may have been already accepted or withdrawn',
    });
  } else {
    user.friends.push(friend._id);
    user.friendRequests = user.friendRequests.filter((id) => id !== friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    return res.status(200).json({ message: 'Friend request accepted' });
  }
}

async function declineFriendRequest(req, res, user, friend) {
  if (!friend.friendRequests.includes(user._id)) {
    return res.status(400).json({
      message:
        'Unable to accept friend request, request may have been already declined or withdrawn',
    });
  } else {
    user.friendRequests = user.friendRequests.filter((id) => id !== friend._id);

    await user.save();

    return res.status(200).json({ message: 'Friend request accepted' });
  }
}

async function withdrawFriendRequest(req, res, user, friend) {
  if (!user.friendRequests.includes(friend._id)) {
    return res.status(400).json({
      message:
        'Unable to withdraw friend request, request may have been already withdrawn',
    });
  } else {
    friend.friendRequests = friend.friendRequests.filter((id) => id !== user._id);

    await friend.save();

    return res.status(200).json({ message: 'Friend request accepted' });
  }
}
