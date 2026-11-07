import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { EditCourseModal } from '../EditCourseModal';
import type { Course } from '../../../types';

const baseCourse: Course = {
  id: 'course-1',
  name: '自动控制原理A',
  credits: 3,
  score: 88,
  gpa: 3.8,
  isActive: true,
  semester: '3-1',
  type: '必修',
  isCore: false,
};

const setup = (overrides: Partial<Course> = {}) => {
  const onSave = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(
    <EditCourseModal
      course={{ ...baseCourse, ...overrides }}
      isOpen
      onClose={onClose}
      onSave={onSave}
      existingSemesters={['3-1', '4-1']}
    />
  );
  return { onSave, onClose };
};

const creditsInput = () => screen.getByLabelText('学分') as HTMLInputElement;
const scoreInput = () => screen.getByLabelText('成绩') as HTMLInputElement;
const nameInput = () => screen.getByLabelText('课程名称') as HTMLInputElement;
const semesterInput = () => screen.getByLabelText('学期') as HTMLInputElement;

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: /保存更改/ }));

/** 断言字段处于「校验失败」状态：aria-invalid 且错误文案与输入框关联。 */
const expectFieldError = (input: HTMLElement, message: string) => {
  expect(input).toHaveAttribute('aria-invalid', 'true');
  const error = screen.getByRole('alert');
  expect(error).toHaveTextContent(message);
  expect(input).toHaveAttribute('aria-describedby', error.id);
};

describe('EditCourseModal 校验', () => {
  test('清空学分后保存：不调用 onSave，并提示学分错误', () => {
    const { onSave } = setup();

    fireEvent.change(creditsInput(), { target: { value: '' } });
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expectFieldError(creditsInput(), '请输入有效的学分');
    expect(creditsInput()).toHaveValue(null);
  });

  test('清空成绩后保存：不调用 onSave，并提示成绩错误', () => {
    const { onSave } = setup();

    fireEvent.change(scoreInput(), { target: { value: '' } });
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expectFieldError(scoreInput(), '请输入有效的成绩');
  });

  test('成绩填 150：不调用 onSave，并提示范围错误', () => {
    const { onSave } = setup();

    fireEvent.change(scoreInput(), { target: { value: '150' } });
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expectFieldError(scoreInput(), '请输入有效的成绩 (0-100)');
  });

  test.each(['0', '-1', '-0.5'])(
    '学分填 %s：不调用 onSave，并提示学分必须大于 0',
    value => {
      const { onSave } = setup();

      fireEvent.change(creditsInput(), { target: { value } });
      submit();

      expect(onSave).not.toHaveBeenCalled();
      expectFieldError(creditsInput(), '请输入有效的学分');
    }
  );

  test('课程名为空白或学期为空：不调用 onSave', () => {
    const { onSave } = setup();

    fireEvent.change(nameInput(), { target: { value: '   ' } });
    submit();
    expect(onSave).not.toHaveBeenCalled();
    expectFieldError(nameInput(), '请输入课程名称');

    fireEvent.change(nameInput(), { target: { value: ' 自动控制原理A ' } });
    fireEvent.change(semesterInput(), { target: { value: '   ' } });
    submit();
    expect(onSave).not.toHaveBeenCalled();
    expectFieldError(semesterInput(), '请输入学期');
  });

  test('成绩 0 与 100 是合法边界值', () => {
    const { onSave } = setup();

    fireEvent.change(scoreInput(), { target: { value: '0' } });
    submit();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenLastCalledWith(
      'course-1',
      '自动控制原理A',
      3,
      0,
      '3-1',
      '必修',
      false
    );

    fireEvent.change(scoreInput(), { target: { value: '100' } });
    submit();
    expect(onSave).toHaveBeenLastCalledWith(
      'course-1',
      '自动控制原理A',
      3,
      100,
      '3-1',
      '必修',
      false
    );
  });

  test('合法输入：调用 onSave，参数为 trim 后的字符串与数值', () => {
    const { onSave } = setup();

    fireEvent.change(nameInput(), { target: { value: '  数据结构  ' } });
    fireEvent.change(semesterInput(), { target: { value: ' 4-1 ' } });
    fireEvent.change(creditsInput(), { target: { value: '4.5' } });
    fireEvent.change(scoreInput(), { target: { value: '95' } });
    fireEvent.change(screen.getByLabelText('属性'), {
      target: { value: '选修' },
    });
    fireEvent.click(screen.getByRole('button', { name: /设为核心\/主干课程/ }));
    submit();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      'course-1',
      '数据结构',
      4.5,
      95,
      '4-1',
      '选修',
      true
    );
    // 成功提交后不应残留任何错误提示。
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('修改字段后对应错误提示消失', () => {
    const { onSave } = setup();

    fireEvent.change(creditsInput(), { target: { value: '' } });
    submit();
    expect(creditsInput()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('请输入有效的学分');

    fireEvent.change(creditsInput(), { target: { value: '3' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(creditsInput()).toHaveAttribute('aria-invalid', 'false');
    expect(creditsInput()).not.toHaveAttribute('aria-describedby');
    expect(onSave).not.toHaveBeenCalled();
  });

  test('修正后再次提交可以正常保存', () => {
    const { onSave } = setup();

    fireEvent.change(creditsInput(), { target: { value: '' } });
    submit();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(creditsInput(), { target: { value: '2' } });
    submit();

    expect(onSave).toHaveBeenCalledWith(
      'course-1',
      '自动控制原理A',
      2,
      88,
      '3-1',
      '必修',
      false
    );
  });

  test('多个字段同时非法时，各自显示自己的错误提示', () => {
    const { onSave } = setup();

    fireEvent.change(nameInput(), { target: { value: '' } });
    fireEvent.change(creditsInput(), { target: { value: '' } });
    fireEvent.change(scoreInput(), { target: { value: '150' } });
    submit();

    expect(onSave).not.toHaveBeenCalled();
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
    const messages = alerts.map(alert => alert.textContent ?? '');
    expect(messages.some(text => text.includes('请输入课程名称'))).toBe(true);
    expect(messages.some(text => text.includes('请输入有效的学分'))).toBe(true);
    expect(messages.some(text => text.includes('请输入有效的成绩'))).toBe(true);
  });

  test('脏数据课程（credits/gpa 为 null）打开弹窗不崩溃，且空值不能直接保存', () => {
    const dirty = {
      ...baseCourse,
      credits: null as unknown as number,
      gpa: null as unknown as number,
    };
    const onSave = vi.fn();

    expect(() =>
      renderWithProviders(
        <EditCourseModal
          course={dirty}
          isOpen
          onClose={vi.fn()}
          onSave={onSave}
          existingSemesters={[]}
        />
      )
    ).not.toThrow();

    // null.toString() 会抛错，说明组件内部必须做过兜底；这里断言输入框渲染成了空值。
    expect(creditsInput()).toHaveValue(null);

    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(
      within(
        screen.getByRole('alert').closest('div') as HTMLElement
      ).queryByText(/请输入有效的学分/)
    ).toBeInTheDocument();
  });
});
