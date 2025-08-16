// 基本的な検証テスト（実際のテストフレームワークなしで実行可能）

import { INITIAL_MEDITATION_SCRIPTS } from '../../constants/meditation';
import { MeditationScriptSchema } from '../../types/schemas';
import { generateId, generateSessionId } from '../id';
import { createMeditationSession, completeMeditationSession } from '../session';
import { DEFAULT_USER_PREFERENCES } from '../localStorage';

// 簡単なテストヘルパー
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Running data model validation tests...');

  // Test 1: 瞑想スクリプトの検証
  console.log('Testing meditation scripts validation...');
  INITIAL_MEDITATION_SCRIPTS.forEach((script, index) => {
    try {
      MeditationScriptSchema.parse(script);
      console.log(`✅ Script ${index + 1} (${script.title}) is valid`);
    } catch (error) {
      console.error(`❌ Script ${index + 1} validation failed:`, error);
    }
  });

  // Test 2: ID生成の検証
  console.log('Testing ID generation...');
  const id1 = generateId();
  const id2 = generateId();
  assert(id1 !== id2, 'Generated IDs should be unique');
  assert(id1.length > 0, 'Generated ID should not be empty');
  console.log('✅ ID generation works correctly');

  const sessionId = generateSessionId();
  assert(sessionId.startsWith('session_'), 'Session ID should have correct prefix');
  console.log('✅ Session ID generation works correctly');

  // Test 3: セッション作成の検証
  console.log('Testing session creation...');
  const session = createMeditationSession('basic-breathing', 'test-user');
  assert(session.scriptId === 'basic-breathing', 'Session should have correct script ID');
  assert(session.userId === 'test-user', 'Session should have correct user ID');
  assert(session.completed === false, 'New session should not be completed');
  assert(session.duration === 0, 'New session should have zero duration');
  console.log('✅ Session creation works correctly');

  // Test 4: セッション完了の検証
  console.log('Testing session completion...');
  const completedSession = completeMeditationSession(session, 60, 5, 'Great session!');
  assert(completedSession.completed === true, 'Completed session should be marked as completed');
  assert(completedSession.duration === 60, 'Completed session should have correct duration');
  assert(completedSession.rating === 5, 'Completed session should have correct rating');
  assert(completedSession.notes === 'Great session!', 'Completed session should have correct notes');
  console.log('✅ Session completion works correctly');

  // Test 5: デフォルト設定の検証
  console.log('Testing default preferences...');
  assert(DEFAULT_USER_PREFERENCES.defaultScript === 'basic-breathing', 'Default script should be basic-breathing');
  assert(DEFAULT_USER_PREFERENCES.audioEnabled === true, 'Audio should be enabled by default');
  assert(DEFAULT_USER_PREFERENCES.volume >= 0 && DEFAULT_USER_PREFERENCES.volume <= 1, 'Volume should be between 0 and 1');
  console.log('✅ Default preferences are valid');

  console.log('🎉 All tests passed!');
}

// Node.js環境でのみ実行
if (typeof window === 'undefined') {
  runTests();
}

export { runTests };

// Jest tests
describe('Data Model Validation', () => {
  it('should validate meditation scripts', () => {
    INITIAL_MEDITATION_SCRIPTS.forEach((script) => {
      expect(() => MeditationScriptSchema.parse(script)).not.toThrow();
    });
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should create meditation sessions correctly', () => {
    const session = createMeditationSession('basic-breathing', 'test-user');
    expect(session.scriptId).toBe('basic-breathing');
    expect(session.userId).toBe('test-user');
    expect(session.completed).toBe(false);
    expect(session.duration).toBe(0);
  });

  it('should complete meditation sessions correctly', () => {
    const session = createMeditationSession('basic-breathing', 'test-user');
    const completedSession = completeMeditationSession(session, 60, 5, 'Great session!');
    expect(completedSession.completed).toBe(true);
    expect(completedSession.duration).toBe(60);
    expect(completedSession.rating).toBe(5);
    expect(completedSession.notes).toBe('Great session!');
  });
});