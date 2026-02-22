using Atlas.Api.OAuth;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Moq;
using Xunit;

namespace Atlas.Api.Tests.OAuth;

public sealed class DistributedCacheOAuthStateStoreTests
{
    [Fact]
    public async Task CreateThenConsume_ShouldSucceedOnce_ThenFail()
    {
        var cache = BuildDictionaryBackedCache();
        var store = new DistributedCacheOAuthStateStore(cache.Object);

        var state = await store.CreateStateAsync();

        var firstConsume = await store.TryConsumeStateAsync(state);
        var secondConsume = await store.TryConsumeStateAsync(state);

        firstConsume.Should().BeTrue();
        secondConsume.Should().BeFalse();
    }

    [Fact]
    public async Task TryConsume_WithUnknownState_ShouldReturnFalse()
    {
        var cache = BuildDictionaryBackedCache();
        var store = new DistributedCacheOAuthStateStore(cache.Object);

        var consumed = await store.TryConsumeStateAsync("missing-state");

        consumed.Should().BeFalse();
    }

    private static Mock<IDistributedCache> BuildDictionaryBackedCache()
    {
        var storage = new Dictionary<string, byte[]>(StringComparer.Ordinal);
        var mock = new Mock<IDistributedCache>();

        mock.Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string key, CancellationToken _) =>
                storage.TryGetValue(key, out var value) ? value : null);

        mock.Setup(x => x.SetAsync(
                It.IsAny<string>(),
                It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(),
                It.IsAny<CancellationToken>()))
            .Callback((string key, byte[] value, DistributedCacheEntryOptions _, CancellationToken __) =>
            {
                storage[key] = value;
            })
            .Returns(Task.CompletedTask);

        mock.Setup(x => x.RemoveAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback((string key, CancellationToken _) => storage.Remove(key))
            .Returns(Task.CompletedTask);

        return mock;
    }
}
