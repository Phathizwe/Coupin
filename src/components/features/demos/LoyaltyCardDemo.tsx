import React from "react";

function LoyaltyCardDemo() {
  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">Coffee Rewards</h3>
            <p className="text-purple-100">Sarah's Card</p>
          </div>
          <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            Gold Member
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Free Coffee</span>
              <span>8/10</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: "80%" }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm">Total Points</span>
            <span className="font-bold text-xl">2,450</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LoyaltyCardDemo };