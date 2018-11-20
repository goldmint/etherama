using Etherama.Common;

namespace Etherama.CoreLogic.Services.Notification {

	public abstract class BaseNotification {

		public NotificationType Type { get; private set; }

		public BaseNotification(NotificationType type) {
			Type = type;
		}

		protected abstract string SerializeContentToStringInner();
		protected abstract void DeserializeContentFromStringInner(string data);
		protected abstract void ValidateContentInner();

		public string SerializeContentToString() {
			ValidateContentInner();
			return SerializeContentToStringInner();
		}

		public void DeserializeContentFromString(string data) {
			DeserializeContentFromStringInner(data);
			ValidateContentInner();
		}
	}
}
