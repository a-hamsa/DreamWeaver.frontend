import React from 'react';

const ProjectDetails: React.FC = () => {
  return (
    <div id="details" className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About DreamWeaver</h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
          DreamWeaver is your personal gateway into the subconscious. Log your dreams, let our advanced AI
          analyze and transform them into creative narratives, and join a community of dream enthusiasts.
          Whether you’re looking for personal insights or collaborative storytelling, DreamWeaver offers a
          unique blend of technology and art.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold mb-2">AI Dream Analysis</h3>
          <p className="text-gray-600">
            Our state-of-the-art AI examines the details of your dreams to uncover hidden themes, sentiments,
            and creative interpretations.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold mb-2">Public Gallery & Community</h3>
          <p className="text-gray-600">
            Share your published dreams, explore a gallery of anonymous dreams, and interact through likes,
            comments, and collaborative storytelling.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">
            Dive into personalized insights and trends derived from your dream entries, and see how your
            subconscious evolves over time.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold mb-2">Real-time Chat & Admin Panel</h3>
          <p className="text-gray-600">
            Engage with fellow dreamers via real-time chat, and for administrators, manage users, dreams,
            and community interactions effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;