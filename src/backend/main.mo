import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type Message = {
    role : Role;
    content : Text;
    timestamp : Int;
  };

  type Role = {
    #user;
    #assistant;
  };

  let messages = List.empty<Message>();

  public shared ({ caller }) func addMessage(role : Role, content : Text) : async () {
    let message : Message = {
      role;
      content;
      timestamp = Time.now();
    };
    messages.add(message);
  };

  public query ({ caller }) func getMessages() : async [Message] {
    messages.toArray();
  };

  public shared ({ caller }) func clearHistory() : async () {
    if (messages.isEmpty()) {
      Runtime.trap("History is already empty");
    } else {
      messages.clear();
    };
  };
};
